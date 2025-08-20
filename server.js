import { app } from "./app.js";
import morgan from "morgan";

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const port = process.env.PORT || 5100;

app.listen(port, () => {
  console.log(`Server is listening on PORT ${port} in ${process.env.NODE_ENV}`);
});
