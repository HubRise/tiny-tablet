var baseAuthenticationPage = 'http://localhost:4003/oauth2/v1/authorize';
var getTokenUrl = 'http://localhost:4003/oauth2/v1/token';
var apiUrl = 'http://localhost:4000/v1';

var clientId = '810615872081.clients.localhost';
var clientSecret = '476e13958a1001aca6a57438949e361c459c917481af8ea474438c341acbc371';

var nbOrders = 10;

new Vue({
  el: '#app',

  data: {
    accessToken: null,
    authenticationPage: null,
    user: null,
    location: null,
    orders: [],
    selectedOrder: null,
  },

  methods: {
    fetchAccessToken: function (code) {
      var vm = this;

      axios.post(getTokenUrl, {
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
      })
          .then(function (response) {
            vm.setAccessToken(response.data.access_token);
          })
          .catch(function (error) {
            console.log("ERROR fetchAccessToken : " + error);
          });
    },

    setAccessToken: function (accessToken) {
      var vm = this;
      vm.accessToken = accessToken;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        vm.fetchUserAndLocation();
        vm.fetchOrders();
      } else {
        localStorage.removeItem('accessToken');
        vm.orders = [];
        vm.user = null;
        vm.location = null;
      }
    },

    logout: function () {
      this.setAccessToken(null);
    },

    fetchUserAndLocation: function () {
      var vm = this;
      vm.apiRequest('/user', function (data) {
        vm.user = data;
      });
      vm.apiRequest('/location', function (data) {
        vm.location = data;
      });
    },

    fetchOrders: function () {
      var vm = this;
      vm.apiRequest('/location/orders', function (data) {
        vm.orders = data.reverse().splice(0, nbOrders);
      });
    },

    apiRequest: function (endpoint, successCallback) {
      var vm = this;
      if (!vm.accessToken) return;

      axios.get(apiUrl + endpoint, {
        headers: {
          'X-Access-Token': vm.accessToken,
          'Content-Type': 'application/json'
        }
      })
          .then(function (response) {
            successCallback(response.data);
          })
          .catch(function (error) {
            console.log("ERROR " + endpoint + ": " + error);
            alert("Problem! Please login again or check console for more details.");
            vm.logout();
          });
    },

    openPopup: function (order) {
      this.selectedOrder = order;
      $('#order-popup').modal({})
    },
  },

  created: function () {
    var vm = this,
        storedAccessToken = localStorage.getItem('accessToken');

    if (storedAccessToken) {
      vm.setAccessToken(storedAccessToken)
    } else {
      window.location.search.substr(1).split('&').forEach(function (item) {
        var tmp = item.split("=");
        if (tmp[0] === 'code') {
          var code = decodeURIComponent(tmp[1]);
          vm.fetchAccessToken(code);
        }
      });
    }

    this.authenticationPage =
        baseAuthenticationPage +
        '?redirect_uri=' + window.location.href + '&client_id=' + clientId + '&scope=location[orders.read],profile';
  },

  components: {
    'orderRow': {
      template: '<tr @click="$emit(\'popup\', order)"><td>{{ time_s(order.created_at) }}</td><td>{{ order.id }}</td><td v-html="statusBadge"></td><td>{{order.total}}</td></tr>',

      props: ['order'],

      methods: {
        time_s: function (s) {
          var d = new Date(Date.parse(s));
          return d.toLocaleDateString() + " " + d.toLocaleTimeString();
        }
      },

      computed: {
        statusBadge: function () {
          var status = this.order.status,
              statusClass = {new: 'badge-secondary'}[status] || 'badge-light';
          return '<span class="badge ' + statusClass + '">' + status + '</span>';
        }
      }
    },

    'orderPopup': {
      template: '#order-popup-template',

      props: ['order'],
    }
  },
})
;