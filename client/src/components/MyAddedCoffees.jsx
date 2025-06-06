import axios from "axios";
import React, { use, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import CoffeeCard from "./CoffeeCard";

const MyAddedCoffees = () => {
	const { user } = use(AuthContext);
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const response = await axios.get(`${import.meta.env.VITE_apiUrl}/my-coffees?email=${user.email}`);
				setData(response.data);
			} catch (error) {
				console.error("Data fetch error:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [user.email]);

	console.log(data);

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<span className="loading loading-spinner text-primary"></span>
			</div>
		);
	}

	return (
		<div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-12">
				{data.length === 0 ? (
					<>
						<h1>You didn't added any coffees</h1>
					</>
				) : (
					data.map((coffee) => <CoffeeCard key={coffee._id} coffee={coffee}></CoffeeCard>)
				)}
			</div>
		</div>
	);
};

export default MyAddedCoffees;
