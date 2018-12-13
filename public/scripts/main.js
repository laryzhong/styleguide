// expand collapsed options in navigation
document.getElementById('expand').addEventListener('click', e => {
	e.preventDefault();
	const componentDropdown = document.getElementById('dropdown');
	componentDropdown.classList.toggle('hide');
});

// collapse aside off screen
document.getElementById('nav-toggle').addEventListener('click', () => {
	const aside     = document.getElementsByClassName('aside');
	const content   = document.getElementsByClassName('content');
	const navToggle = document.getElementById('nav-toggle');

	aside[0].classList.toggle('nav-closed');
	content[0].classList.toggle('nav-closed');
	navToggle.classList.toggle('nav-closed');
});

// toggle hex vs rgb code on colour palette page
const buttonList = document.querySelectorAll('button');
const hexButton  = buttonList[0];
const rgbButton  = buttonList[1];
const colorRgb   = document.querySelectorAll('.color-rgb');
const colorHex   = document.querySelectorAll('.color-hex');

hexButton.addEventListener('click', () => {
	hexButton.classList.remove('selected');
	rgbButton.classList.remove('selected');
	hexButton.classList.add('selected');

	i = 0,
	rgbLength = colorRgb.length;

	for (i; i < rgbLength; i++) {
		colorRgb[i].style.display = 'none';
		colorHex[i].style.display = 'block';
	}

});
rgbButton.addEventListener('click', () => {
	rgbButton.classList.remove('selected');
	hexButton.classList.remove('selected');
	rgbButton.classList.add('selected');

	i = 0,
	hexLength = colorHex.length;

	for (i; i < hexLength; i++) {
		colorHex[i].style.display = 'none';
		colorRgb[i].style.display = 'block';
	}

});