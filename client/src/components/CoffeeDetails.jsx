import axios from "axios";
import React, { useContext, useState } from "react";
import toast from "react-hot-toast";
import { useLoaderData } from "react-router";
import { AuthContext } from "../contexts/AuthContext";

const CoffeeDetails = () => {
	const { data: coffee } = useLoaderData();
	const { _id, name, quantity, supplier, taste, price, details, photo, email, likedBy } = coffee || {};

	const { user } = useContext(AuthContext);
	const [likes, setLikes] = useState(likedBy.length);
	const [alreadyLiked, setAlreadyLiked] = useState(likedBy.includes(user?.email));
	const isOwnCoffee = user?.email === email;
	const handleLike = async () => {
		if (!user || alreadyLiked) return toast("You have already liked");

		try {
			const res = await axios.patch(`${import.meta.env.VITE_apiUrl}/coffee/${_id}/like`, {
				email: user.email,
			});

			if (res.status === 200) {
				setLikes((prev) => prev + 1);
				setAlreadyLiked(true);
				toast.success("Thanks for your like");
			}
		} catch (error) {
			toast.error("Like failed:", error);
		}
	};

	const [currentQuantity, setCurrentQuantity] = useState(quantity);
	const handleOrder = async () => {
		if (!user) return toast.error("Please login to order");
		if (currentQuantity <= 0) return toast.error("Out of stock");

		try {
			const res = await axios.post(`${import.meta.env.VITE_apiUrl}/order/${_id}`, {
				buyerEmail: user.email,
			});

			if (res.data.success) {
				toast.success("Order placed");
				setCurrentQuantity((prev) => prev - 1);
			}
		} catch (error) {
			toast.error("Order failed");
		}
	};
	return (
		<div className="p-12 max-w-md mx-auto space-y-2 text-center">
			<figure>
				<img src={photo} alt="" className="rounded-lg" />
			</figure>
			<div>
				<h3>Name:</h3>
				<h1 className="text-xl font-bold">{name}</h1>
			</div>
			<div>
				<h3>Quantity:</h3>
				<h1 className="text-lg font-bold">{currentQuantity}</h1>
			</div>
			<div>
				<h3>supplier:</h3>
				<h1 className="text-lg font-bold">{supplier}</h1>
			</div>
			<div>
				<h3>taste:</h3>
				<h1 className="text-lg font-bold">{taste}</h1>
			</div>
			<div>
				<h3>price:</h3>
				<h1 className="text-lg font-bold">{price}</h1>
			</div>
			<div>
				<h3>details:</h3>
				<h1 className="text-lg font-bold">{details}</h1>
			</div>
			<div>
				<h3>email:</h3>
				<h1 className="text-lg font-bold">{email}</h1>
			</div>
			<div>
				<h3>likedBy:</h3>
				<h1 className="text-lg font-bold">{likes}</h1>
			</div>
			<div className="flex gap-2 justify-center">
				<button className="btn btn-primary" onClick={handleOrder} disabled={currentQuantity <= 0 || isOwnCoffee}>
					{isOwnCoffee ? "Can't Order Own Coffee" : currentQuantity <= 0 ? "Out of Stock" : "Order"}
				</button>
				<button className="btn btn-secondary" onClick={handleLike} disabled={alreadyLiked || isOwnCoffee}>
					{alreadyLiked ? "Liked" : isOwnCoffee ? "Can't Like Own" : "Like"}
				</button>
			</div>
		</div>
	);
};

export default CoffeeDetails;
