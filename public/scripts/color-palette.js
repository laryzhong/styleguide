
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

// copy hex or rgb value to clipboard
const copyToClipboard = str => {
	const el = document.createElement('textarea');
	el.value = str;
	document.body.appendChild(el);
	el.select();
	document.execCommand('copy');
	console.log('copied!');
	document.body.removeChild(el);
};
