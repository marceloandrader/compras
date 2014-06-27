var Producto = function(data) {
  var self = this;
  self.nombre = ko.observable(data.nombre || '');
  self.cantidad = ko.observable(data.cantidad || 1);
  self.precio = ko.observable(data.precio || '');
  self.comprado = ko.observable(data.comprado || false);
  self.total = ko.computed(function () {
    return self.precio() * self.cantidad();
  });
  self.clone = function() {
    var newOne = new Producto(ko.toJS(self));
    return newOne;
  };
  self.reset = function() {
    self.nombre('');
    self.precio('');
    self.cantidad(1);
  };
  self.valid = function() {
    return self.nombre() != '' && self.precio() != '';
  };
};
var App = function() {
  var self = this;
  localforage.setDriver('localStorageWrapper');
  self.displayForm = ko.observable(false);
  self.showForm = function() {
    self.editando(null);
    self.displayForm(true);
  };
  self.closeForm = function() {
    self.displayForm(false);
  };
  self.lista = ko.observableArray();
  self.lista.subscribe(function(newVal) {
    localforage.ready(function() {
      var toSave = ko.utils.arrayMap(self.lista() || [], function(producto) {
        return ko.toJS(producto);
      });
      
      localforage.setItem('lista', toSave);
    });
  });
  self.loadPreviousData = function() {
    localforage.ready(function() {
      localforage.getItem('lista', function(data) {
        ko.utils.arrayForEach(data || [], function(producto) {
          self.lista.unshift(new Producto(producto));
        });
      });
    });
  };
  self.editando = ko.observable(null);
  self.nuevo = new Producto({});
  self.agregarNuevo = function() {
    if (!self.nuevo.valid()) {
      alert('Llene todos los datos');
      return;
    }
    self.lista.push(self.nuevo.clone());
    self.nuevo.reset();
    self.displayForm(false);
  };
  self.salvarCambios = function() {
    var indexOf = self.lista.indexOf(self.editando());
    self.lista.splice(indexOf, 1, self.editando().clone());
    self.editando(null);
    self.displayForm(false);
  };
  self.eliminar = function($data) {
    self.lista.remove($data);
  };
  self.editar = function($data) {
    self.editando($data);
    self.displayForm(true);
  };
  self.totalCarrito = ko.computed(function() {
    var total = 0;
    ko.utils.arrayForEach(self.lista() || [], function(producto) {
      if (producto.comprado())
      {
        total += producto.total();
      }
    });
    return total.toFixed(2);
  });
  self.totalLista = ko.computed(function() {
    var total = 0;
    ko.utils.arrayForEach(self.lista() || [], function(producto) {
      total += producto.total();
    });
    return total.toFixed(2);
  });
  self.precioAsc = true;
  self.ordenarPorPrecio = function() {
    self.lista.sort(function(a,b) {
      if (  self.precioAsc  ) {
        return a.precio() == b.precio() ? 0 : (a.precio() < b.precio());
      }
      else {
        return a.precio() == b.precio() ? 0 : (a.precio() > b.precio());
      }
    });
    self.precioAsc = !self.precioAsc;
  };
  self.totalAsc = true;
  self.ordenarPorTotal = function() {
    self.lista.sort(function(a,b) {
      if (  self.totalAsc  ) {
        return a.total() == b.total() ? 0 : (a.total() < b.total());
      }
      else {
        return a.total() == b.total() ? 0 : (a.total() > b.total());
      }
    });
    self.totalAsc = !self.totalAsc;
  };
  self.nombreAsc = true;
  self.ordenarPorNombre = function() {
    self.lista.sort(function(a,b) {
      if (  self.nombreAsc  ) {
        return a.nombre() == b.nombre() ? 0 : (a.nombre() < b.nombre());
      }
      else {
        return a.nombre() == b.nombre() ? 0 : (a.nombre() > b.nombre());
      }
    });
    self.nombreAsc = !self.nombreAsc;
  };
  self.compradoAsc = true;
  self.ordenarPorComprado = function() {
    self.lista.sort(function(a,b) {
      if (  self.compradoAsc  ) {
        return a.comprado() == b.comprado() ? 0 : (a.comprado() < b.comprado());
      }
      else {
        return a.comprado() == b.comprado() ? 0 : (a.comprado() > b.comprado());
      }
    });
    self.compradoAsc = !self.compradoAsc;
  };
};
export default App;
