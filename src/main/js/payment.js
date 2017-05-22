class Payment {
    constructor() {
        this.token_function = function (token) {
            console.log(token)
        };
        this.pay_obj = {};
    }

    create() {
        var self = this;
        this.pay_configure = StripeCheckout.configure({
            key: 'pk_test_pWX6UmqrRBJr80k790ebWI1f',
            image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
            locale: 'auto',
            token: self.token_function
        });
        self.pay_configure.open(self.pay_obj);

        window.addEventListener('popstate', function () {
            self.pay_configure.close();
        });
    }
}

export default Payment