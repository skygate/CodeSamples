// The code presented below is an example taken from the real project
// which provides ordering the food via mobile application.

// This particular example demonstrates how we retrieve and display list 
// of user's orders (from dedicated API). All imports have been removed.

/*               EXAMPLE OF SCREEN               */
class OrdersPage extends StatefulWidget {
  @override
  _OrdersPageState createState() => _OrdersPageState();
}

class _OrdersPageState extends State<OrdersPage> {
  List<Order> orders = [];
  bool isLoading = true;
  int loadingSkeletonsAmount = 5;

  @override
  void initState() {
    super.initState();

    // Reading data from local storage:
    StorageActions.readToken().then((token) async {
      if (token != null) {
        // Sending request to API:
        List<Order> ordersFromAPI = await getUserOrders(token);
        // Rebuilding UI, stopping displaying skeleton loaders:
        if (mounted)
          setState(() {
            orders = ordersFromAPI;
            isLoading = false;
          });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            CustomAppBar(
              content: 'My orders',
              leftIcon: Image.asset('assets/arrow_left.png', width: 16.5),
              leftIconOnPressed: () {
                // Go back:
                Navigator.of(context).pop();
              },
            ),
            Expanded(
              child: orders.length > 0 || isLoading
                  ? SingleChildScrollView(
                      child: Column(
                        children: [
                          SizedBox(height: 30),
                          Divider(
                            color: CustomColors.dividerColor,
                            height: 1,
                            thickness: 1,
                          ),
                          // List of orders / list of skeleton loaders 
                          // (before receiving response from API):
                          ListView.separated(
                            physics: NeverScrollableScrollPhysics(),
                            padding: EdgeInsets.zero,
                            shrinkWrap: true,
                            itemCount: isLoading
                                ? loadingSkeletonsAmount
                                : orders.length,
                            itemBuilder: (BuildContext context, int index) {
                              return isLoading
                                  ? EmptyOrdersRow()
                                  : OrdersRow(order: orders[index]);
                            },
                            separatorBuilder: (BuildContext context, int index) {
                              return Divider(
                                color: CustomColors.dividerColor,
                                height: 1,
                                thickness: 1,
                              );
                            },
                          ),
                          Divider(
                            color: CustomColors.dividerColor,
                            height: 1,
                            thickness: 1,
                          ),
                        ],
                      ),
                    )
                    // Placeholder instead of blank page:
                  : EmptyView(title: 'No orders yet.'),
            ),
          ],
        ),
      ),
    );
  }
}

/*              EXAMPLE OF API CONNECTION              */
Future<List<Order>> getUserOrders(String token) async {
  Response response;

  try {
    response = await Dio().get(
      USER_ORDERS_URL,
      options: Options(
        headers: {
          "Authorization": "JWT $token",
        },
      ),
    );
  } catch (error) {
    print(error);
    return [];
  }

  return List<Order>.from(response.data.map(
    (order) => Order.fromJson(order),
  ));
}
