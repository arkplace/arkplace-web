// TODO: Implements model layer containing business logic

import {loadJSON, canvasBootstrap} from "/js/utils.js";
import CanvasHandler from "/js/canvas.js";

export default class ArkPlace{
  constructor(name, canvas_size) {
    // TODO: Initialize CanvasHandler object
    let canvasObj = new CanvasHandler(name, canvas_size);
    this.data;
    var peersJsonFile = "/peers.json";
    canvasBootstrap(canvasObj);
    loadJSON(this.callbackPeersReceived, peersJsonFile);
    console.log(this);

    // TODO: Hardcode network parameters and app constants
  }

  callbackPeersReceived(response) {
    var actual_JSON = JSON.parse(response);
    console.log(actual_JSON[1].ip);
  }

  // ----------------------------------------------------------------------
  // Editing
  // TODO: Set depth
  // TODO: Set pixel
  // TODO: Set pixel values
  // TODO: Make transaction

  // ----------------------------------------------------------------------
  // Protocol
  // TODO: Get seed peers
  // TODO: Get peers from seed nodes
  // TODO: Check API open
  // TODO: Get random peer (minimize chance of hitting api rate limit)
  // TODO: Get transactions for address
  // TODO: Parse vendorfield (elminate XSS vectors)
  // TODO: Decode command
  // TODO: Validate command

  // ----------------------------------------------------------------------
  // Coordinator address functions
  // TODO: Get active canvas

  // ----------------------------------------------------------------------
  // Canvas address functions
  // TODO: Get base unit
  // TODO: Get multiplier
  // TODO: Get canvas status
  // TODO: Get topic

  // User commands
  // TODO: Draw on canvas

  // Admin commands
  // TODO: Freeze canvas
  // TODO: Invalidate canvas
  // TODO: Create new canvas
  // TODO: Set canvas base unit
  // TODO: Set canvas fee multiplier
  // TODO: Set canvas topic
  // TODO: Whitelist address
  // TODO: Timeout address

};
