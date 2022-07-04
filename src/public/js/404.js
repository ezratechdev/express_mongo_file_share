const go_home = document.getElementsByClassName('home')[0];
go_home.addEventListener('click', () => {
    const new_anchor = document.createElement('a');
    new_anchor.href = '/';
    new_anchor.click();
});