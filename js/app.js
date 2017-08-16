var baseAuthenticationPage = 'http://localhost:4003/oauth2/v1/authorize';
var getTokenUrl = 'http://localhost:4003/oauth2/v1/token';
var apiUrl = 'http://localhost:4000/v1';

var clientId = '810615872081.clients.localhost';
var clientSecret = '476e13958a1001aca6a57438949e361c459c917481af8ea474438c341acbc371';

new Vue({
  el: '#app',

  data: {
    accessToken: null,
    authenticationPage: null,
    orders: []
  },

  methods: {
    getAccessToken: function (code) {
      var vm = this;

      axios.post(getTokenUrl, {
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
      })
          .then(function (response) {
            console.log("SUCCESS getAccessToken : " + response.data);
            console.log("response.data.access_token = " + response.data.access_token);
            vm.accessToken = response.data.access_token;
            vm.getOrders();
          })
          .catch(function (error) {
            console.log("ERROR getAccessToken : " + error);
          });
    },

    getOrders: function () {
      var vm = this;

      axios.get(apiUrl + '/location/orders', {
        headers: {
          'X-Access-Token': this.accessToken,
          'Content-Type': 'application/json'
        }
      })
          .then(function (response) {
            console.log("SUCCESS getOrders : " + response.data);
            vm.orders = response.data;
          })
          .catch(function (error) {
            console.log("ERROR getOrders : " + error);
          });
    }
  },

  created: function () {
    var vm = this;
    window.location.search.substr(1).split('&').forEach(function (item) {
      var tmp = item.split("=");
      if (tmp[0] === 'code') {
        var code = decodeURIComponent(tmp[1]);
        vm.getAccessToken(code);
      }
    });

    this.authenticationPage =
        baseAuthenticationPage +
        '?redirect_uri=' + window.location.href + '&client_id=' + clientId + '&scope=location[orders.read]';
  },

  components: {
    'order': {
      template: '<div>{{ order.id }} <b>{{ order.status}}</b> {{order.total}} </div>',

      props: ['order'],
    }
  }
});