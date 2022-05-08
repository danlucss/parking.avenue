"use strict";
class ParkingFront {
    constructor($, garage = new Garage()) {
        this.$ = $;
        this.garage = garage;
    }
    add(car, salve = false) {
        this.garage.add(car);
        const row = document.createElement('tr');
        row.innerHTML = `
                <td>${car.name}</td>
                <td>${car.id}</td>
                <td data-time="${car.entry}">
                    ${car.entry.toLocaleString('pt-BR', {
            hour: 'numeric',
            minute: 'numeric'
        })}
                </td>
                <td>
                    <button class="delete">x</button>
                </td>
            `;
        if (salve) {
            this.garage.salve();
        }
        this.$('#garage').appendChild(row);
    }
    exit(cells) {
        if (cells[2] instanceof HTMLElement) {
            const veicle = {
                name: cells[0].textContent || '',
                id: cells[1].textContent || '',
                time: new Date().valueOf() -
                    new Date(cells[2].dataset.time).valueOf()
            };
            this.garage.exit(veicle);
        }
    }
    render() {
        this.$('#garage').innerHTML = '';
        this.garage.patio.forEach(c => this.add(c));
    }
}
class Garage {
    constructor() {
        this.patio = localStorage.patio ? JSON.parse(localStorage.patio) : [];
    }
    add(car) {
        this.patio.push(car);
    }
    exit(info) {
        const time = this.calcTime(info.time);
        const msg = `
      O veículo ${info.name} de placa ${info.id} permaneceu ${time} estacionado.
      \n\n Deseja encerrar?
    `;
        if (!confirm(msg))
            return;
        this.patio = this.patio.filter(car => car.id !== info.id);
        this.salve();
    }
    calcTime(mil) {
        var min = Math.floor(mil / 60000);
        var sec = Math.floor((mil % 60000) / 1000);
        return `${min}m e ${sec}s`;
    }
    salve() {
        console.log('Saving...');
        localStorage.patio = JSON.stringify(this.patio);
    }
}
;
(function () {
    const $ = (q) => {
        const elem = document.querySelector(q);
        if (!elem)
            throw new Error('Ocorreu um erro ao buscar o elemento.');
        return elem;
    };
    const parking = new ParkingFront($);
    parking.render();
    $('#send').addEventListener('click', () => {
        const name = $('#name').value;
        const id = $('#licence').value;
        if (!name || !id) {
            alert('Os campos são obrigatórios.');
            return;
        }
        const car = { name, id, entry: new Date() };
        parking.add(car, true);
        $('#name').value = '';
        $('#licence').value = '';
    });
    $('#garage').addEventListener('click', ({ target }) => {
        if (target.className === 'delete') {
            parking.exit(target.parentElement.parentElement.cells);
            parking.render();
        }
    });
})();
