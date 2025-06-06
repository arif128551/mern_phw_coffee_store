import React, { use, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

const MyOrders = () => {
	const { user } = use(AuthContext);
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const response = await axios.get(`${import.meta.env.VITE_apiUrl}/my-orders?email=${user.email}`);
				setData(response.data);
			} catch (error) {
				console.error("Data fetch error:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [user.email]);

	const handleCancel = async (orderId) => {
		const confirm = window.confirm("Are you sure you want to cancel this order?");
		if (!confirm) return;

		try {
			const res = await axios.delete(`${import.meta.env.VITE_apiUrl}/order/${orderId}`);
			if (res.data.success) {
				toast.success("Order cancelled");
				setData((prev) => prev.filter((order) => order._id !== orderId));
			}
		} catch (error) {
			toast.error("Failed to cancel order");
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<span className="loading loading-spinner text-primary"></span>
			</div>
		);
	}
	return (
		<div className="overflow-x-auto">
			<table className="table">
				<thead>
					<tr>
						<th>Sl.</th>
						<th>Coffee Name</th>
						<th>Price</th>
						<th>Quantity</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					{data.map((order, index) => (
						<tr key={order._id}>
							<th>{index + 1}</th>
							<td>
								<div className="flex items-center gap-3">
									<div className="avatar">
										<div className="mask mask-squircle h-12 w-12">
											<img src={order.coffeePhoto} alt={order.coffeeName} />
										</div>
									</div>
									<div>
										<div className="font-bold">{order.coffeeName}</div>
										<div className="text-sm opacity-50">{order.orderTime}</div>
									</div>
								</div>
							</td>
							<td>{order.price}</td>
							<td>{order.quantity}</td>
							<th>
								<button className="btn btn-warning" onClick={() => handleCancel(order._id)}>
									Cancel
								</button>
							</th>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default MyOrders;
