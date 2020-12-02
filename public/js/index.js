function loadmail(name) {
  document.getElementById('fileview').src = `/view/${name}?inline`
  Array.from(document.getElementsByClassName(`active`)).forEach(element => element.classList.remove('active'))
  document.getElementById(`item_${name}`).classList.add('active')
  document.getElementsByClassName(`Index__MailList`)[0].classList.remove('Index__MailList--show')
}

function toggleMobile() {
  document.getElementsByClassName(`Index__MailList`)[0].classList.toggle('Index__MailList--show')
}

document.onkeydown = function(evt) {
  evt = evt || window.event;
  if (evt.code.startsWith('KeyD')) {
    document.getElementsByClassName('Index')[0].classList.add('Index--meta')
  }
};

document.onkeyup = function(evt) {
  evt = evt || window.event;
  if (evt.code.startsWith('KeyD')) {
    document.getElementsByClassName('Index')[0].classList.remove('Index--meta')
  }
};
