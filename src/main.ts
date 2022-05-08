interface Car {
  name: string
  id: string
  entry: Date
}

interface Exit {
  name: string
  id: string
  time: number
}

class ParkingFront {
  constructor(
    private $: (q: string) => HTMLInputElement,
    private garage = new Garage()
  ) {}

  add(car: Car, salve = false) {
    this.garage.add(car)

    const row = document.createElement('tr')
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
            `

    if (salve) {
      this.garage.salve()
    }

    this.$('#garage').appendChild(row)
  }

  exit(cells: HTMLCollection) {
    if (cells[2] instanceof HTMLElement) {
      const veicle = {
        name: cells[0].textContent || '',
        id: cells[1].textContent || '',
        time:
          new Date().valueOf() -
          new Date(cells[2].dataset.time as string).valueOf()
      }

      this.garage.exit(veicle)
    }
  }

  render() {
    this.$('#garage').innerHTML = ''
    this.garage.patio.forEach(c => this.add(c))
  }
}

class Garage {
  public patio: Car[]
  constructor() {
    this.patio = localStorage.patio ? JSON.parse(localStorage.patio) : []
  }

  add(car: Car) {
    this.patio.push(car)
  }

  exit(info: Exit) {
    const time = this.calcTime(info.time)

    const msg = `
      O veículo ${info.name} de placa ${info.id} permaneceu ${time} estacionado.
      \n\n Deseja encerrar?
    `

    if (!confirm(msg)) return

    this.patio = this.patio.filter(car => car.id !== info.id)

    this.salve()
  }

  private calcTime(mil: number) {
    var min = Math.floor(mil / 60000)
    var sec = Math.floor((mil % 60000) / 1000)
    return `${min}m e ${sec}s`
  }

  salve() {
    console.log('Saving...')
    localStorage.patio = JSON.stringify(this.patio)
  }
}

;(function () {
  const $ = (q: string) => {
    const elem = document.querySelector<HTMLInputElement>(q)

    if (!elem) throw new Error('Ocorreu um erro ao buscar o elemento.')

    return elem
  }

  const parking = new ParkingFront($)
  parking.render()

  $('#send').addEventListener('click', () => {
    const name = $('#name').value
    const id = $('#licence').value

    if (!name || !id) {
      alert('Os campos são obrigatórios.')
      return
    }

    const car: Car = { name, id, entry: new Date() }

    parking.add(car, true)

    $('#name').value = ''
    $('#licence').value = ''
  })

  $('#garage').addEventListener('click', ({ target }: MouseEvent | any) => {
    if (target.className === 'delete') {
      parking.exit(target.parentElement.parentElement.cells)
      parking.render()
    }
  })
})()
