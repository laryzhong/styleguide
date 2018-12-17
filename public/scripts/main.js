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