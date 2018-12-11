document.getElementById('expand').addEventListener('click', function (e) {
    e.preventDefault();
    const componentDropdown = document.getElementById('dropdown');
    componentDropdown.classList.toggle('hide');
});