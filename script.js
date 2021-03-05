const link = document.getElementById('app_link');
link.href = window.origin.split('https').join('http').split('http').join('https') + '/app';

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
    var upButton = document.getElementById('upButton')
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        upButton.style.display = "block";
    } else {
        upButton.style.display = "none";
    }
    // var y = document.defaultView.pageYOffset;
    // if(y < about)document.title = 'Home | Orama';
    // if(about < y && y < app)document.title = 'About | Orama';
    // if(app < y && y < help)document.title = 'App | Orama';
    // if(help < y && y < authors)document.title = 'Help Us | Orama';
    // if(authors < y )document.title = 'Authors | Orama';
}
 
// var about = document.getElementById('about').offsetTop;
// var app = document.getElementById('app').offsetTop;
// var help = document.getElementById('help').offsetTop;
// var authors = document.getElementById('authors').offsetTop;
