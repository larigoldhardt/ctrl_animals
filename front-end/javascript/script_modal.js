const openModalBtn = document.getElementById('openModalCadastro');
const openModalBtnEntrada = document.getElementById('openModalEntrada');
const openModalBtnSaida = document.getElementById('openModalSaida');

const closeModalBtn = document.getElementById('closeModalBtn');
const closeModalBtnE = document.getElementById('closeModalBtnE');
const closeModalBtnS = document.getElementById('closeModalBtnS');

const modalCad = document.getElementById('modalCadastro');
const modalEnt = document.getElementById('modalEntrada');
const modalSai = document.getElementById('modalSaida');

openModalBtn.addEventListener('click', () => {
    modalCad.style.display = 'flex';
});

closeModalBtn.addEventListener('click', () => {
    modalCad.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modalCad) {
        modalCad.style.display = 'none';
    }
});



openModalBtnEntrada.addEventListener('click', () => {
    modalEnt.style.display = 'flex';
});

closeModalBtnE.addEventListener('click', () => {
    modalEnt.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modalEnt) {
        modalEnt.style.display = 'none';
    }
});





openModalBtnSaida.addEventListener('click', () => {
    modalSai.style.display = 'flex';
});

closeModalBtnS.addEventListener('click', () => {
    modalSai.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modalSai) {
        modalSai.style.display = 'none';
    }
});