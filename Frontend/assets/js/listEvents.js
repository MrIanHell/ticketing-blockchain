// Create a the section where events will be listed
const app = document.getElementById('content')
const events = document.createElement('section')
events.setAttribute('id', 'highlights')

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
const address = backendLayerAddress

// Open a new connection, using the GET request on the events endpoint
request.open('GET', address + '/events', true)

// Setting up auth header from client's saved jwt for requests
$.ajaxSetup({
    headers: { 'Authorization': Cookies.get('jwt') }
})

request.onload = function () {
    const data = JSON.parse(this.response)
    $("#events-qty").html('<strong>Total number of events:</strong> ' + data['numberOfEvents'])

    data['events'].forEach(event => {
        // Create a div with the highlight class
        const col = document.createElement('div')
        col.setAttribute('class', 'col-4 col-12-medium')

        // Create a div with the highlight class
        const eventInfo = document.createElement('section')
        eventInfo.style = 'border: solid 3px; padding: 1em; background: #f3f3f3 url("images/overlay.png");'
        eventInfo.setAttribute('class', 'highlight')

        // Create an h3 and set the text content to the event's title
        const h3 = document.createElement('h3')
        h3.style = 'font-size: 1.4em'
        h3.textContent = event.name

        // Get time and date of event
        const date = new Date(event.date)
        const dateTime = document.createElement('p')
        dateTime.innerHTML = date.toDateString() + ' <br />' + (date.getHours() < 10 ? '0' : '') +
            date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()

        // Get description of event
        const desc = document.createElement('p')
        event.description = event.description.substring(0, 200)
        desc.innerHTML = `${event.description}...`

        // Create response message for delete button
        const responseMsg = document.createElement('p')
        responseMsg.setAttribute('id', 'response-message')
        responseMsg.setAttribute('style', 'margin-top: 0.75em;')
        const responseMessage = $(responseMsg)

        // Create delete button if user logged in is the organiser of the event
        const buttonDiv = document.createElement('div')
        buttonDiv.setAttribute('style', 'text-align: center;')
        const deleteButton = document.createElement('a')
        deleteButton.setAttribute('class', 'button style3')
        deleteButton.textContent = 'Delete'
        deleteButton.style = 'height: 3.5em; width: auto; line-height: 3.5em; font-size: 0.75em; margin: 1em 3px 0 3px; display: inline-block;'
        $.getJSON(address + '/auth', (authInfo) => {
            if (authInfo['userId'] == event['organiserID']) buttonDiv.appendChild(deleteButton)
        })

        // Delete the event when clicking the delete button using a DELETE request
        $(deleteButton).click(e => {
            $.ajax({
                type: "DELETE",
                url: address + '/events/' + event['_id'],
            }).done(data => {
                responseMessage.removeClass()
                responseMessage.addClass('success-message')
                responseMessage.text(data['message'])
                $('#pageloader').css('visibility', 'hidden')
            }).fail((jqXHR, textStatus, errorThrown) => {
                responseMessage.removeClass()
                responseMessage.addClass('error-message')
                if (errorThrown == 'Unauthorized') {
                    responseMessage.text('Please log in to delete the event')
                } else if (jqXHR.responseJSON['message']) {
                    responseMessage.text(jqXHR.responseJSON['message'])
                } else if (jqXHR.responseJSON['error']) {
                    responseMessage.text(jqXHR.responseJSON['error'])
                }
                else {
                    responseMessage.text('Internal server error')
                }
                $('#pageloader').css('visibility', 'hidden')
            })
        })

        // Create button that links to event
        const moreInfo = document.createElement('a')
        moreInfo.setAttribute('href', 'eventInfo.html?id=' + event._id)
        moreInfo.setAttribute('class', 'button style1')
        moreInfo.setAttribute('style', 'height: 3.5em; line-height: 3.5em; font-size: 0.75em;')
        moreInfo.innerHTML = 'More Info'
        buttonDiv.appendChild(moreInfo)


        // Append the everything to the row element
        row.appendChild(col)
        col.appendChild(eventInfo)
        eventInfo.appendChild(h3)
        eventInfo.appendChild(dateTime)
        eventInfo.appendChild(desc)
        eventInfo.appendChild(buttonDiv)
        eventInfo.appendChild(responseMsg)
    })
}

request.send()