# Finesse Multi-MRD Ready/Not Ready Gadget

This is a **custom Cisco Finesse Gadget** that modifies the way agent states are set across multiple media routing domains (MRDs). Specifically, this gadget:

1. Sets the agent’s **Ready** or **Not Ready** state **first** on non-voice MRDs, and **then** applies the change to the voice MRD.
2. Allows agents to select a **Not Ready Reason Code** from a dropdown before changing to the Not Ready state.

This project is based on a fork of Cisco’s sample code available in the CiscoDevNet repository here:  
[https://github.com/CiscoDevNet/finesse-sample-code/tree/master/DevNetLearningLabSampleGadget](https://github.com/CiscoDevNet/finesse-sample-code/tree/master/DevNetLearningLabSampleGadget)

---

## Table of Contents
- [Finesse Multi-MRD Ready/Not Ready Gadget](#finesse-multi-mrd-readynot-ready-gadget)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Architecture and Files](#architecture-and-files)
    - [Code Flow](#code-flow)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Customization](#customization)
  - [Open Caveats](#open-caveats)
  - [License](#license)
    - [Contributing / Feedback](#contributing--feedback)

---

## Overview

Cisco Finesse is the Web Based Agent Desktop for PCCE, UCCE, WxCCE and UCCX. This gadget only works with PCCE, UCCE, WxCCE.
In a typical scenario, an agent can handle multiple channels (Voice, Chat, Email, etc.) provisioned through separate MRDs (Media Routing Domains). 

By default, Finesse’s “Ready”/“Not Ready” buttons work in a more generic way—this gadget introduces a special approach to ensure non-voice MRDs are toggled first, and then the voice MRD is updated. This sequence can be useful in scenarios where you want to gracefully manage agent availability across different channels.

## Features

1. **Multi-MRD State Management**  
   - **READY**: Sets agent state to Ready on all non-voice MRDs first, then on the voice MRD.  
   - **NOT READY**: Sets agent state to Not Ready on non-voice MRDs, then on the voice MRD.

2. **Reason Code Selection**  
   - Provides a dropdown for selecting a **Not Ready Reason Code** before changing the state.

3. **Dynamic Media Detection**  
   - Dynamically detects logged-in MRDs and updates states accordingly.

4. **User Info Display**  
   - Shows agent details such as ID, name, extension, role, team info, and MRD states.

5. **Simple UI**  
   - Straightforward, single-page user interface.

---

## Architecture and Files

This gadget consists of a few main files:

1. **buttonnotready.xml**  
   - The XML definition of the gadget as recognized by Cisco Finesse.  
   - References the JavaScript and CSS files required for the gadget to function.

2. **buttonnotready.js**  
   - Core business logic for interacting with the Finesse REST API.  
   - Handles retrieving reason codes, setting agent state, logging messages, and other interactions.

3. **buttonnotready.css**  
   - (Optional) Contains custom styling for the gadget UI (not shown in this repo snippet, but you can create your own).

### Code Flow

- **Initialization**  
  When the gadget is loaded, `finesse.modules.buttonnotready.init()` is called, initializing logging, setting up event handlers, fetching user information, and populating the reason codes.

- **Populating the UI**  
  Once user and media objects are fetched from Finesse, the gadget populates fields like the user’s name, extension, role, team, and current state. It also loads available **Not Ready Reason Codes** into a dropdown list.

- **State Changes**  
  When the agent clicks “Change state to READY” or “Change state to NOT READY”:  
  1. The gadget iterates over **non-voice MRDs** first.  
  2. Sets them to the chosen state (with a selected Reason Code if Not Ready).  
  3. After a short delay, sets the **voice MRD** to the same state.

---

## Installation

1. **Clone or Download this Repository**  
   - Copy the files (`buttonnotready.xml`, `buttonnotready.js`, and `buttonnotready.css`) onto a local folder.

2. **Upload to Cisco Finesse Server**  
   - Follow [this guide](https://developer.cisco.com/docs/finesse/upload-third-party-gadgets/#automatic-compression-of-thirdparty-gadget-resources)

---

## Usage

1. **Open the Finesse Desktop**  
   - Log in as an agent.  
   - Navigate to the tab or panel where you added the “Multi-MRD Ready/Not Ready” gadget.

2. **Review Your Current State**  
   - The gadget will display your current user info, including user ID, name, extension, team, and your current state.  
   - It will also show the MRDs you’re logged into and the states of each MRD.

3. **Select a Not Ready Reason Code (Optional)**  
   - If you plan to set yourself to Not Ready, select an appropriate reason code from the dropdown.

4. **Change State**  
   - Click **“Change state to READY”** or **“Change state to NOT READY”**.  
   - The gadget logs each step, setting your non-voice MRDs first, followed by the voice MRD.

5. **Verify the Results**  
   - Refresh or check another Finesse gadget (like the stock Team Performance gadget) to see that your state updated correctly across channels.

---

## Customization


- **State Change Timing**  
  - The gadget uses a small delay (setTimeout) between updating non-voice MRDs and the voice MRD. Feel free to adjust this delay in `buttonnotready.js` if you need more or less time.

- **UI/Styling**  
  - You can customize the layout, colors, fonts, etc., by editing or adding to `buttonnotready.css`.

---

## Open Caveats

1. **Non-Voice Channel widget goes out of sync**

Whenever this custom gadget is used, the out of the box Non-Voice State control Gadget will go out of sync with the real agent state. It can be resyncronized by just using the out of the box gadget. More work is needed to use the Channel Service as documented [here](https://developer.cisco.com/docs/finesse/channel-service/)

## License

This project is based on the [Cisco Finesse sample code](https://github.com/CiscoDevNet/finesse-sample-code), which is provided under the terms specified in that repository. Any modifications or additional code here are contributed under the same or a compatible open-source license, unless otherwise stated.

---

### Contributing / Feedback

Pull requests, bug reports, and feature requests are welcome! If you find any issues or have suggestions for improvement, feel free to reach out.

---

**Author**: Carles  Duz Palau
**Based On**: CiscoDevNet Finesse Sample Gadget