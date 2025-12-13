const link = document.getElementById('css-theme-link');
const theme = localStorage.getItem('verdis_theme') ?? 'default';

if (theme !== 'default') {
    link.href = `/assets/css/themes/${theme}.css`;
} else {
    link.href = '/assets/css/colors.css';
}