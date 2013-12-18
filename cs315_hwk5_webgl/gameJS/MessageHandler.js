"use strict";

var ERRORS = [];


function addErrorMessage(msg) {
	ERRORS.push(msg);
	_rerenderErrors();
}


function _rerenderErrors() {
	$("#error").html(ERRORS.join("<br />"));
	if (!$("#error").is(":visible")) {
		$("#error").fadeIn();
	}
}
