import { Outlet, useNavigation } from "react-router";
import Header from "../components/Header";
import { use } from "react";
import { AuthContext } from "../contexts/AuthContext";

const MainLayout = () => {
	const { loading } = use(AuthContext);
	const navigation = useNavigation();
	const isLoading = navigation.state === "loading";
	if (loading || isLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<span className="loading loading-spinner text-primary"></span>
			</div>
		);
	}
	return (
		<div>
			<Header></Header>
			<div className="max-w-7xl mx-auto">
				<Outlet></Outlet>
			</div>
		</div>
	);
};

export default MainLayout;
