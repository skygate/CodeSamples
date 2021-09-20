// This is code example which is taken from the real project
// where we are using React and GraphQL Apollo + Firebase 
// Database and Cloud Functions

// This particular example demonstrate how we publish 
// product to external website using cloud functions
// all the proper imports are removed


// *** FRONTEND ***

// In react component import mutation and call it
const [publishProduct] = useMutation(PUBLISH_PRODUCT);
await publishProduct({
  variables: {
    product: {
      title: state.title,
      description: state.description,
      price: state.price,
      pictures: links, 
      services: services
    }
  }
});

// Created Mutation in the queries directory
export const PUBLISH_PRODUCT = gql`
  mutation PublishProduct($product: PublishProductInput!) {
    publishProduct(product: $product)
  }
`;

// In the resolvers directory created resolver and type
@Resolver()
export default class ProductResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(isAuthenticated)
  async publishProduct(
    @Arg('product') product: PublishProductInput,
    @Ctx() ctx: ResolverContext
  ): Promise<boolean> {
    return ctx.productConnector.publishProduct(product, ctx.me.uid, ctx.fcm);
  }
}

// Product Input Type
@InputType()
class PublishProductInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  price: string;

  @Field(type => [String])
  pictures: string[];

  @Field(type => [String])
  services: string[];
}

// In the connector directory add connector which creates job and passes product data
class ProductConnector {
  async publishProduct(product: any, uid: string, fcm: string) {
    await Database.ref(`/jobs/${uid}`).push({
      action: 'publishProduct',
      createdAt: new Date(),
      ts: new Date().getTime(),
      status: 'pending',
      error: null,
      // We can pass Firebase Cloud Messaging to notify user when the job is completed
      fcm,
      payload: {
        ...product,
      }
    });
    return true;
  }
}

// *** BACKEND (CLOUD FUNCTIONS) ***

// In the index of the jobs directory call appropriate functions
if (action === ACTIONS.PUBLISH_PRODUCT) {
  return publishProduct(job, context, getMode(job?.status), config);
}

// Publish product function
async function publishProduct(job, context, mode, config) {
  const { ...product } = job.payload;
  const uid = context.uid;

  const services = await getUserConectedApps({ uid });
  const publishedServices = [];

  // Loop through available services
  for (const [service, data] of Object.entries(services)) {
    if (data.status === "linked") {
      const filters = { uid, service };
      const credentialsData = await getCredentials(filters);
      const credentialsObject = JSON.parse(credentialsData);
      try {
        // Run the scrapper which publishes product to the external website
        // We use puppeteer for scrapper functionality
        await ScrapperFactory.get(service).publishProduct({
          product,
          credentialsObject,
        });
        publishedServices.push(data.name);
      } catch (error) {
        console.error(error);
        // Send notification through FCM
        await sendNotification(job.fcm, {
          title: "Product was not published to " + data.name,
        });
        continue;
      }
    }
  }

  // Send notification through FCM
  await sendNotification(job.fcm, {
    title: "Product was published",
    body: `"${product.title}" published at ${publishedServices.join(" y ")}!`,
  });

  // Send email (this is also backend function which uses 
  // node mailer and pug email templates)
  await sendMail(
    {
      templateId: PRODUCT_PUBLISHED_EMAIL_ID,
      templateData: {
        title: product.title,
        price: product.price,
        description: product.description,
        platforms: publishedServices.join(", "),
      },
    },
    uid,
    config.email
  );
}
