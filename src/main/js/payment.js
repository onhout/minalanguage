class Payment {
    constructor() {
        this.token_function = (token) => {
            console.log(token)
        };
        this.pay_obj = {};
    }

    create() {
        var self = this;
        this.pay_configure = StripeCheckout.configure({
            key: 'pk_live_FIfPHyXp3JfYXIqWm688dCGB',
            image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
            locale: 'auto',
            token: self.token_function
        });
        self.pay_configure.open(self.pay_obj);
        window.addEventListener('popstate', () => {
            self.pay_configure.close();
        });
    }
}
export default Payment