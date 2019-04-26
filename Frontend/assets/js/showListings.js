const address = backendLayerAddress
$('#pageloader').css('visibility', 'visible') // Show loading screen whilst fetching tickets

// Setting up auth header from client's saved jwt for requests
$.ajaxSetup({
    headers: { 'Authorization': Cookies.get('jwt') }
})

// Make GET request to fetch tickets owned by authenticated user from the backend layer
$.getJSON(address + '/tickets/sellListings', (listingsData) => {
    $("#total-ticket-qty").html('<strong>Total number of ticket listings:</strong> ' + listingsData['numberOfListings'])
    listingsData['listings'].forEach(listing => {
        $('#pageloader').css('visibility', 'hidden')
        $.getJSON(address + '/events/' + listing['eventID'], (eventInfo) => {
            const cell = $('<div class="col-4 col-12-medium"></div>')

            // Create ticket info highlight section
            const ticketInfo = $('<section class="highlight"></section>')
            ticketInfo.attr('style', 'border: solid 3px; padding: 1em; background: #f3f3f3 url("images/overlay.png");')

            // Generate elements and store ticket listing information
            const heading = $('<h3><a href="eventInfo.html?id=' + eventInfo['_id'] + '">' + eventInfo['name'] + '</a></h3>')
            heading.css('font-size', '1.4em')
            const date = new Date(eventInfo['date'])
            const dateTime = $('<p style="margin: 0;">' + date.toDateString() + ' <br />' + (date.getHours() < 10 ? '0' : '') +
                date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() +'</p><br />')
            const quantity = $('<p style="margin: 0;"><strong>Remaining Tickets:</strong> ' + listing['quantity'] + '</p>')
            const sellPrice = $('<p style="margin: 0;"><strong>Price per Ticket:</strong> £' + listing['sellPrice'].toFixed(2) + '</p>')

            // Create buy and delete buttons
            const buttonDiv = $('<div style="text-align: center;"></div>')
            const buyButton = $('<input type="submit" class="style1" value="Buy" />')
            const deleteButton = $('<a class="button style3">Delete</a>')
            const buttonCSS = 'height: 3.5em; width: auto; line-height: 3.5em; font-size: 0.75em; margin: 1em 3px 0 3px; display: inline-block;'
            buyButton.attr('style', buttonCSS)
            deleteButton.attr('style', buttonCSS)
            buttonDiv.append(buyButton)

            // Append delete button to listing if user is logged in and owns the ticket listing
            $.getJSON(address + '/auth', (authInfo) => {
                if (authInfo['userId'] == listing['sellerID']) buttonDiv.append(deleteButton)
            })

            // Construct the buy tickets form
            const buyTicketsForm = $('<form method="post" action=' + address + '/tickets/sellListings/buy' + '></form>')
            const ticketQuantity = $('<input type="number" min="1" max="' + listing['quantity'] + '" name="quantity" placeholder="Ticket Quantity to Buy" required/>')
            const hiddenListingID = $('<input type="hidden" name="listingID" value="' + listing['_id'] + '" />')
            const fillerDiv = $('<div></div>')
            const responseMessage = $('<p id="response-message" style="margin-top: 0.75em;"></p>')
            const inputCSS = 'margin: 3px; width: auto; display: inline-block;'
            buyTicketsForm.attr('style', 'width: auto; margin-top: 25px;')
            ticketQuantity.attr('style', inputCSS)
            buyTicketsForm.append(ticketQuantity)
            buyTicketsForm.append(ticketQuantity)
            buyTicketsForm.append(hiddenListingID)
            buyTicketsForm.append(fillerDiv)
            buyTicketsForm.append(buttonDiv)
            buyTicketsForm.append(responseMessage)

            // When form is submitted send POST request to /tickets/sellListings/buy
            // endpoint using form data to buy ticket(s) from sell listing for the user
            buyTicketsForm.submit(e => {
                $('#pageloader').css('visibility', 'visible')
                e.preventDefault();

                $.ajax({
                    type: "POST",
                    url: buyTicketsForm.attr('action'),
                    data: buyTicketsForm.serialize(),
                }).done(data => {
                    responseMessage.removeClass()
                    responseMessage.addClass('success-message')
                    responseMessage.text(data['message'])
                    $('#pageloader').css('visibility', 'hidden')
                }).fail((jqXHR, textStatus, errorThrown) => {
                    responseMessage.removeClass()
                    responseMessage.addClass('error-message')
                    if (errorThrown == 'Unauthorized') {
                        responseMessage.text('Please log in to buy tickets from the listing')
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

            // Delete the listing when clicking the delete button using a DELETE request
            deleteButton.click(e => {
                $.ajax({
                    type: "DELETE",
                    url: address + '/tickets/sellListings/' + listing['_id'],
                }).done(data => {
                    responseMessage.removeClass()
                    responseMessage.addClass('success-message')
                    responseMessage.text(data['message'])
                    $('#pageloader').css('visibility', 'hidden')
                }).fail((jqXHR, textStatus, errorThrown) => {
                    responseMessage.removeClass()
                    responseMessage.addClass('error-message')
                    if (errorThrown == 'Unauthorized') {
                        responseMessage.text('Please log in to delete the listing')
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

            // Append all created elements with contained ticket information to DOM
            $('#row').append(cell)
            cell.append(ticketInfo)
            ticketInfo.append(heading)
            ticketInfo.append(dateTime)
            ticketInfo.append(quantity)
            ticketInfo.append(sellPrice)
            ticketInfo.append(buyTicketsForm)
            $('#pageloader').css('visibility', 'hidden')
        })
    })
}).fail((jqXHR, textStatus, errorThrown) => {
    $('#pageloader').css('visibility', 'hidden')
    if (errorThrown == 'Unauthorized') {
        $('#subheading-message').text('Please log in to buy tickets')
    } else if (jqXHR.responseJSON['message']) {
        $('#subheading-message').text(jqXHR.responseJSON['message'])
    }
    else {
        $('#subheading-message').text('Internal server error')
    }
})