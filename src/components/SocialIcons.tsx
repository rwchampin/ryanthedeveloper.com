"use client";
import { Proximity } from "components/Proximity";
import Link from "next/link";
import {
	FaInstagram,
	FaTwitter,
	FaFacebook,
	FaYoutube,
	FaTiktok,
	FaPatreon,
} from "react-icons/fa6";


export const SocialIcons=({
	size=24,
	color="black",
}) => {
	return (
		<div className="flex space-x-4">
			<Proximity href="https://instagram.com/ryan_the_dev">
			<FaInstagram size={size} color={color} />
			</Proximity>
			<Proximity href="https://twitter.com/ryanthedeveloper">
			<FaTwitter size={size} color={color} />
			</Proximity>
			<Proximity href="https://facebook.com/ryanthdve">
			<FaFacebook size={size} color={color} />
			</Proximity>
			<Proximity href="https://youtube.com/ryanthedeveloper">
			<FaYoutube size={size} color={color} />
			</Proximity>
			<Proximity href="https://tiktok.com/@ryan_the_dev">
			<FaTiktok size={size} color={color} />
			</Proximity>
			<Proximity href="https://patreon.com/ryanthedeveloper">
			<FaPatreon size={size} color={color} />
			</Proximity>
		</div>
	);
}