var finesse = finesse || {};
finesse.gadget = finesse.gadget || {};
finesse.container = finesse.container || {};

/*global logFinesse */
finesse.modules = finesse.modules || {};

finesse.modules.buttonnotready = (function ($) {
  var clientLogs,
    user,
    mediaList,
    reasonCodes,
    reasonCodeSelect, // NEW: We'll store a reference to the dropdown
    // Called once the MediaList is initially loaded
    handleMediaListLoaded = function () {
      clientLogs.log("Media list has been loaded.");
      populateGadget();
    },
    // Called whenever a new Media object is added
    handleMediaAdd = function (media) {
      clientLogs.log("Media added: " + media.getMediaType());
      populateGadget();
    },
    // Called whenever a Media object is deleted
    handleMediaDelete = function (media) {
      clientLogs.log("Media removed: " + media.getMediaType());
      populateGadget();
    },
    // Handler for change agent state failures
    handleChangeStateError = function (error) {
      clientLogs.log("handleChangeStateError(): Error changing state");
      clientLogs.log("ErrorXML: " + error.content);
      clientLogs.log("ErrorData: " + error.object.ApiErrors.ApiError.ErrorData);
      clientLogs.log(
        "ErrorMessage: " + error.object.ApiErrors.ApiError.ErrorMessage
      );
      clientLogs.log("ErrorType: " + error.object.ApiErrors.ApiError.ErrorType);
    },
    // NEW: Function to populate the reason code dropdown
    populateReasonCodes = function () {
      user.getNotReadyReasonCodes({
        success: function (rsp) {
          reasonCodes = rsp;
          reasonCodeSelect.empty();
          if (!reasonCodes || reasonCodes.length === 0) {
            reasonCodeSelect.append(
              $("<option></option>").val("").text("No reason codes found")
            );
            return;
          }
          $.each(reasonCodes, function (i, reasonCode) {
            reasonCodeSelect.append(
              $("<option></option>").val(reasonCode.id).text(reasonCode.label)
            );
          });
        },
      });
    },
    // Populates the fields in the gadget with data
    populateGadget = function () {
      var currentState = user.getState();

      mediaList = user.getMediaList({
        onCollectionAdd: handleMediaAdd,
        onCollectionDelete: handleMediaDelete,
        onLoad: handleMediaListLoaded,
      });

      var mediaCollection = mediaList.getCollection();
      var mrdNames = [];
      var mrdStates = [];

      for (var mediaId in mediaCollection) {
        if (mediaCollection.hasOwnProperty(mediaId)) {
          var media = mediaCollection[mediaId];
          if (media.isLoggedIn()) {
            mrdNames.push(media.getName());
            mrdStates.push(media.getState());
            clientLogs.log(
              "User is in Logged in to" +
                media.getName() +
                "with ID " +
                media.getMediaId() +
                "and current state is " +
                media.getState()
            );
          }
        }
      }

      $("#mrdNames").text(mrdNames.join(", "));
      $("#mrdStates").text(mrdStates.join(", "));

      // Populate other fields
      $("#userId").text(user.getId());
      $("#firstName").text(user.getFirstName());
      $("#lastName").text(user.getLastName());
      if (user.hasSupervisorRole()) {
        $("#userRole").text("Supervisor");
      } else {
        $("#userRole").text("Agent");
      }
      $("#extension").text(user.getExtension());
      $("#userState").text(currentState);
      $("#teamId").text(user.getTeamId());
      $("#teamName").text(user.getTeamName());

      // Show/hide the state change buttons (existing logic)
      if (currentState === finesse.restservices.User.States.NOT_READY) {
        $("#goReady").show();
        $("#goNotReady").hide();
      } else if (currentState === finesse.restservices.User.States.READY) {
        $("#goNotReady").show();
        $("#goReady").hide();
      } else {
        $("#goNotReady").hide();
        $("#goReady").hide();
      }

      // Adjust gadget height
      gadgets.window.adjustHeight();
    },
    // Handler for all User updates
    handleUserChange = function (userevent) {
      populateGadget();
    },
    // Handler for the onLoad of the User object
    handleUserLoad = function (userevent) {
      // Populate reason codes once the user object is loaded
      populateReasonCodes();

      // Now populate the rest of the gadget
      populateGadget();
    };

  return {
    /**
     * Sets the user state (e.g. READY or NOT_READY).
     * MODIFIED: We now pass the selected reason code if the state is NOT_READY
     */
    setUserState: function (state) {
      mediaList = user.getMediaList({
        onCollectionAdd: handleMediaAdd,
        onCollectionDelete: handleMediaDelete,
        onLoad: handleMediaListLoaded,
      });

      var mediaCollection = mediaList.getCollection();
      var selectedReasonCode = null;

      if (state === finesse.restservices.User.States.NOT_READY) {
        var selectedReasonCodeId = reasonCodeSelect.val();

        // Find the matching ReasonCode object
        $.each(reasonCodes, function (i, reasonCode) {
          if (reasonCode.id === selectedReasonCodeId) {
            selectedReasonCode = reasonCode;
            return false; // break out of the loop
          }
        });

        clientLogs.log("Selected ReasonCode ID: " + selectedReasonCodeId);
      }

      // For each logged-in media, set its state
      for (var mediaId in mediaCollection) {
        if (mediaCollection.hasOwnProperty(mediaId)) {
          var media = mediaCollection[mediaId];
          if (media.isLoggedIn()) {
            if (state === finesse.restservices.User.States.NOT_READY) {
              // Pass in the entire ReasonCode object
              media.setState(state, selectedReasonCode, {
                error: handleChangeStateError,
              });
            } else {
              media.setState(state, null, {
                error: handleChangeStateError,
              });
            }
          }
        }
      }

      // Then set the overall user state after some delay
      setTimeout(function () {
        if (state === finesse.restservices.User.States.NOT_READY) {
          user.setState(state, selectedReasonCode, {
            error: handleChangeStateError,
          });
        } else {
          user.setState(state, null, {
            error: handleChangeStateError,
          });
        }
      }, 4000);
    },

    /**
     * Gadget initialization
     */
    init: function () {
      var cfg = finesse.gadget.Config;

      // Initialize logging
      clientLogs = finesse.cslogger.ClientLogger;
      clientLogs.init(gadgets.Hub, "buttonnotready", cfg);

      // Keep a handle to the reason code dropdown
      reasonCodeSelect = $("#reasonCodeSelect"); // NEW

      // Initialize the BOSH connection
      finesse.clientservices.ClientServices.init(cfg);

      // ContainerServices for tab handling
      containerServices = finesse.containerservices.ContainerServices.init();
      containerServices.addHandler(
        finesse.containerservices.ContainerServices.Topics.ACTIVE_TAB,
        function () {
          clientLogs.log("Gadget is now visible");
          gadgets.window.adjustHeight();
        }
      );
      containerServices.makeActiveTabReq();

      // Create the User object for the logged in user
      user = new finesse.restservices.User({
        id: cfg.id,
        onLoad: handleUserLoad,
        onChange: handleUserChange,
      });
    },
  };
})(jQuery);
