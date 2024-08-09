import logging

logger = logging.getLogger(__name__)

class OrderManager:
    def __init__(self):
        self.orders = []

    def place_order(self, user_id, tshirt_design):
        order_id = len(self.orders) + 1
        order = {
            "order_id": order_id,
            "user_id": user_id,
            "tshirt_design": tshirt_design,
            "status": "Pending"
        }
        logger.debug(f"Placing order: {order}")
        self.orders.append(order)
        return order_id

    def get_order_status(self, order_id):
        logger.debug(f"Fetching status for order ID: {order_id}")
        for order in self.orders:
            if order["order_id"] == order_id:
                return order["status"]
        return "Order not found"

    def update_order_status(self, order_id, status):
        logger.debug(f"Updating status for order ID: {order_id} to {status}")
        for order in self.orders:
            if order["order_id"] == order_id:
                order["status"] = status
                return True
        return False

    def get_all_orders(self):
        logger.debug("Fetching all orders")
        return self.orders

# Example usage
if __name__ == "__main__":
    manager = OrderManager()
    order_id = manager.place_order(1, {"color": "blue", "logos": ["logo1.png", "logo2.png"]})
    print(manager.get_order_status(order_id))
    manager.update_order_status(order_id, "Shipped")
    print(manager.get_order_status(order_id))
    print(manager.get_all_orders())
