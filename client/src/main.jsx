import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router";
import MainLayout from "./layouts/MainLayout.jsx";
import Home from "./components/Home.jsx";
import AddCoffee from "./components/AddCoffee.jsx";
import UpdateCoffee from "./components/UpdateCoffee.jsx";
import CoffeeDetails from "./components/CoffeeDetails.jsx";
import SignIn from "./components/SignIn.jsx";
import SignUp from "./components/SignUp.jsx";
import AuthProvider from "./contexts/AuthProvider.jsx";
import axios from "axios";
import MyAddedCoffees from "./components/MyAddedCoffees.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import MyOrders from "./components/MyOrders.jsx";

const router = createBrowserRouter([
	{
		path: "/",
		Component: MainLayout,
		children: [
			{
				index: true,
				Component: Home,
				loader: () => axios(`${import.meta.env.VITE_apiUrl}/coffees`),
				hydrateFallbackElement: <p>Loading</p>,
			},
			{
				path: "addCoffee",
				Component: AddCoffee,
			},
			{
				path: "coffee/:id",
				Component: CoffeeDetails,
				loader: ({ params }) => axios(`${import.meta.env.VITE_apiUrl}/coffees/${params.id}`),
				hydrateFallbackElement: <p>Loading</p>,
			},
			{
				path: "/my-added-coffees",
				element: (
					<PrivateRoute>
						<MyAddedCoffees></MyAddedCoffees>
					</PrivateRoute>
				),
			},
			{
				path: "/my-orders",
				element: (
					<PrivateRoute>
						<MyOrders></MyOrders>
					</PrivateRoute>
				),
			},
			{
				path: "updateCoffee/:id",

				Component: UpdateCoffee,
			},
			{
				path: "signin",
				Component: SignIn,
			},
			{
				path: "signup",
				Component: SignUp,
			},
		],
	},
]);

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<AuthProvider>
			<RouterProvider router={router} />
			<Toaster position="top-right" />
		</AuthProvider>
	</StrictMode>
);
