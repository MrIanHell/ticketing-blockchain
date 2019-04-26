// Setting up auth header from client's saved jwt for requests
$.ajaxSetup({
    headers: { 'Authorization': Cookies.get('jwt') }
})

// Change nav bar if user is logged in
$.getJSON(backendLayerAddress + '/auth', (authInfo) => {
    $('#nav ul').remove()
    $('#nav').append('<ul></ul>')
    $('#nav ul').append('<li><a href="index.html">Home</a></li>')
    $('#nav ul').append('<li class="current"><a href="events.html">Events</a></li>')
    $('#nav ul').append('<li><a href="createEvent.html">Create Event</a></li>')
    $('#nav ul').append('<li><a href="sellListings.html">Sell Listings</a></li>')
    $('#nav ul').append('<li><a href="tickets.html">Owned Tickets</a></li>')
    $('#nav ul').append('<li><a id="logOut" href="#">Log Out</a></li>')

    $('#logOut').click(e => {
        e.preventDefault()
        Cookies.remove('jwt')
        location.reload()
    })
})