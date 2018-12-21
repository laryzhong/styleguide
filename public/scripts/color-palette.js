
// toggle hex vs rgb code on colour palette page
const buttonList = document.querySelectorAll('button');
const hexButton  = buttonList[0];
const rgbButton  = buttonList[1];
const colorRgb   = document.querySelectorAll('.color-rgb');
const colorHex   = document.querySelectorAll('.color-hex');

// show hex color code + hide RGB color code
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

// show RGB color code + hide hex color code
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
const colorCode = document.querySelectorAll('.color-code');

colorCode.forEach(color => {
	color.addEventListener('click', () => {
		const selection = window.getSelection();
		const range     = document.createRange();
		range.selectNodeContents(color);
		selection.removeAllRanges();
		selection.addRange(range);

		try {
			document.execCommand('copy');
			selection.removeAllRanges();

			const original    = color.textContent;
			color.textContent = 'Copied!';
			setTimeout(() => {
				color.textContent = original;
				color.classList.remove('success');
			}, 800);

		} catch (e) {
			console.log('didnt work');
		}
	});
});