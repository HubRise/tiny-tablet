var authenticationServerUrl = 'http://localhost:4003/oauth2/v1/token';
var apiUrl = 'http://localhost:4000/v1';
var clientId = '810615872081.clients.localhost';
var clientSecret = '476e13958a1001aca6a57438949e361c459c917481af8ea474438c341acbc371';

new Vue({
  el: '#app',

  data: {
    accessToken: '',

    code: '',

    orders: [
      {
        id: '1',
        customer: {
          first_name: 'Julien'
        }
      },
      {
        id: '2',
        customer: {
          first_name: 'Thomas'
        }
      }
    ]
  },

  watch: {
    code: function () {
      if (this.code != '') this.getAccessToken();
    },
  },

  methods: {
    getAccessToken: function () {
      var vm = this

      axios.post(authenticationServerUrl, {
        code: this.code,
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
      var vm = this

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

  components: {
    'order': {
      template: '<div>{{ order.id }} <b>{{ order.status}}</b> {{order.total}} </div>',

      props: ['order'],
    }
  }
});