const app = document.getElementById('content')


// Create a the section where events will be listed
const events = document.createElement('section')
events.setAttribute('id', 'highlights')
events.setAttribute('class', 'wrapper style3')

// Place these events inside a container with appropriate syling
const container = document.createElement('div')
container.setAttribute('class', 'container')
const row = document.createElement('div')
row.setAttribute('class', 'row aln-center')

// Append these elements onto the DOM
app.appendChild(events)
events.appendChild(container)
container.appendChild(row)

// Make a request to our backend API
const request = new XMLHttpRequest()
const address = 'http://localhost:5000'

// Open a new connection, using the GET request on the events endpoint
request.open('GET', address + '/events', true)

request.onload = function () {
    const data = JSON.parse(this.response)

    data['events'].forEach(event => {
        // Create a div with the highlight class
        const col = document.createElement('div')
        col.setAttribute('class', 'col-4 col-12-medium')

        // Create a div with the highlight class
        const eventInfo = document.createElement('section')
        eventInfo.style = 'border: solid 2px; padding: 1em;'
        eventInfo.setAttribute('class', 'highlight')

        // Create an h3 and set the text content to the event's title
        const h3 = document.createElement('h3')
        h3.style = 'font-size: 1.4em'
        h3.textContent = event.name

        // Get time and date of event
        const date = new Date(event.date) 
        const dateTime = document.createElement('p')
        dateTime.innerHTML = date.toDateString() + ' <br />' + date.getHours() + ':' + date.getMinutes()

        // Get description of event
        const desc = document.createElement('p')
        event.description = event.description.substring(0, 200)
        desc.innerHTML =  `${event.description}...`

        // Create button that links to event
        const moreInfo = document.createElement('a')
        moreInfo.setAttribute('href', '#')
        moreInfo.setAttribute('class', 'button style1')
        moreInfo.setAttribute('style', 'height: 3.5em; line-height: 3.5em; font-size: 0.75em;')
        moreInfo.innerHTML = 'More Info'

        // Append the everything to the row element
        row.appendChild(col)
        col.appendChild(eventInfo)
        eventInfo.appendChild(h3)
        eventInfo.appendChild(dateTime)
        eventInfo.appendChild(desc)
        eventInfo.appendChild(moreInfo)
    })
}

request.send()