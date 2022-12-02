const apiUrl = 'https://api.hubrise.com/v1';
const nbOrders = 10;

new Vue({
  el: '#app',

  data: {
    accessToken: null,
    inputAuthCode: null,
    inputAccessToken: null,
    user: null,
    location: null,
    orders: [],
    selectedOrder: null,
  },

  methods: {
    async submitToken(event) {
      event.preventDefault();
      await this.login(this.inputAccessToken);
      this.inputAccessToken = null;
    },

    async login(accessToken) {
      this.accessToken = accessToken;
      localStorage.setItem('accessToken', accessToken);

      try {
        await this.fetchUserAndLocation();
        await this.fetchOrders();
      } catch (error) {
        alert("Your access token seems to be invalid. Try to login again.");
      }
    },

    logout() {
      this.accessToken = null
      localStorage.removeItem('accessToken');

      this.orders = [];
      this.user = null;
      this.location = null;
    },

    async fetchUserAndLocation() {
      const vm = this;
      await this.apiRequest('/user', (data) => vm.user = data)
      await this.apiRequest('/location', (data) => vm.location = data)
    },

    async fetchOrders() {
      const vm = this;
      await this.apiRequest('/location/orders', (data) =>  vm.orders = data.reverse().splice(0, nbOrders))
    },

    async apiRequest(endpoint, onSuccess) {
      try {
        const response = await axios.get(apiUrl + endpoint, {
          headers: {
            'X-Access-Token': this.accessToken,
            'Content-Type': 'application/json'
          }
        })
        onSuccess(response.data);
      } catch(error) {
        this.logout();
        console.log("ERROR " + endpoint + ": " + error);
        throw error;
      }
    },

    openPopup(order) {
      this.selectedOrder = order;
      $('#order-popup').modal({})
    },
  },

  async created() {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (storedAccessToken) await this.login(storedAccessToken);
  },

  components: {
    'orderRow': {
      template: '<tr @click="$emit(\'popup\', order)"><td>{{ time_s(order.created_at) }}</td><td>{{ order.id }}</td><td v-html="statusBadge"></td><td>{{order.total}}</td></tr>',

      props: ['order'],

      methods: {
        time_s(s) {
          const d = new Date(Date.parse(s));
          return d.toLocaleDateString() + " " + d.toLocaleTimeString();
        }
      },

      computed: {
        statusBadge() {
          const status = this.order.status,
                statusClass = {new: 'badge-secondary'}[status] || 'badge-light';
          return '<span class="badge ' + statusClass + '">' + status + '</span>';
        }
      }
    },
  },
});
