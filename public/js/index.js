function loadmail(name) {
  document.getElementById('fileview').src = `/view/${name}?inline`
  Array.from(document.getElementsByClassName(`active`)).forEach(element => element.classList.remove('active'))
  document.getElementById(`item_${name}`).classList.add('active')
}
