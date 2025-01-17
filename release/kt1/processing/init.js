/* *** */
/* This code searches for all the <script type="application/processing" target="canvasid">
 * in your page and loads each script in the target canvas with the proper id.
 * It is useful to smooth the process of adding Processing code in your page and starting
 * the Processing.js engine.
 *
 * Inspired by the original init.js code from John Resig's examples
 */

function initProcessingScripts () {

	var scriptsOnPage, i, curScript, targetCanvas;
	
	scriptsOnPage = document.getElementsByTagName("script");
	
	for (i=0; i < scriptsOnPage.length; i++) {

		curScript = scriptsOnPage[i];
		
		if (scriptsOnPage[i].getAttribute("type") == "application/processing") {
			targetCanvas = document.getElementById(scriptsOnPage[i].getAttribute("targetCanvas"));

			if (targetCanvas) {
				Processing(targetCanvas, curScript.textContent);
			}
		}
	}

}

//document.addEventListener("DOMContentLoaded", initProcessingScripts, false);