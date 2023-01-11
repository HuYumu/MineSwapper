function $(selector) {
    return document.querySelector(selector)
}

function $$(selector) {
    return document.querySelectorAll(selector)
}

function idd(id) {
	return document.getElementById(id)
}

function findMineDescClass(mineNum) {
	var numberDescription = ["zero","one","two","three","four","five",
							"six","seven","eight"]
	return numberDescription[mineNum]
}