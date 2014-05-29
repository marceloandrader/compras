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
    self.lista.unshift(self.nuevo.clone());
    self.nuevo.reset();
  };
  self.salvarCambios = function() {
    self.lista.remove(self.editando());
    self.lista.unshift(self.editando().clone());
    self.editando(null);
  };
  self.eliminar = function($data) {
    self.lista.remove($data);
  };
  self.editar = function($data) {
    self.editando($data);
  };
  self.totalCarrito = ko.computed(function() {
    var total = 0;
    ko.utils.arrayForEach(self.lista() || [], function(producto) {
      if (producto.comprado())
      {
        total += producto.total();
      }
    });
    return total;
  });
  self.totalLista = ko.computed(function() {
    var total = 0;
    ko.utils.arrayForEach(self.lista() || [], function(producto) {
      if (!producto.comprado())
      {
        total += producto.total();
      }
    });
    return total;
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
