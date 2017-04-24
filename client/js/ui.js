var changeMap = function () {
    socket.emit('changeMap');
};

var inventory = new Inventory(null, false);
socket.on('updateInventory', function (items) {
    inventory.items= items;
    inventory.refreshRender();
});

