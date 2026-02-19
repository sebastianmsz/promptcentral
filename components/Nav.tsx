"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { AnimatePresence, motion } from "framer-motion";
import {
	signIn,
	signOut,
	useSession,
	getProviders,
	ClientSafeProvider,
} from "next-auth/react";

const Nav = () => {
	const { data: session } = useSession();
	const [providers, setProviders] = useState<Record<
		string,
		ClientSafeProvider
	> | null>(null);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const toggleMenu = useCallback(() => {
		setIsMenuOpen((prev) => !prev);
	}, []);

	const closeMenu = useCallback(() => setIsMenuOpen(false), []);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (!(e.target as Element).closest(".menu-container")) {
				closeMenu();
			}
		};

		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, [closeMenu]);

	useEffect(() => {
		(async () => {
			const res = await getProviders();
			setProviders(res);
		})();
	}, []);

	const menuVariants = {
		open: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: { type: "spring", stiffness: 300, damping: 24 },
		},
		closed: {
			opacity: 0,
			y: -20,
			scale: 0.95,
			transition: { duration: 0.2 },
		},
	};

	return (
		<nav className="mb-8 flex w-full items-center justify-between pt-3 md:mb-16">
			<Link href="/" className="flex-center flex gap-2">
				<Image
					src="/assets/img/logo.svg"
					alt="Prompteria Logo"
					width={30}
					height={30}
				/>
				<p className="logo_text">Prompteria</p>
			</Link>

			<div className="hidden gap-3 sm:flex">
				<ThemeToggle />
				{session?.user ? (
					<div className="flex gap-3 md:gap-5">
						<Link href="/create-prompt" className="black_btn">
							Create Post
						</Link>
						<button
							type="button"
							onClick={() => signOut({ callbackUrl: "/" })}
							className="outline_btn"
						>
							Sign Out
						</button>
						<Link href={`/profile/${session.user.id}`}>
							<Image
								src={session.user.image || "/assets/img/default-user.svg"}
								width={37}
								height={37}
								className="rounded-full"
								alt="Profile"
							/>
						</Link>
					</div>
				) : (
					<>
						{providers &&
							Object.values(providers).map((provider) => (
								<button
									type="button"
									key={provider.name}
									onClick={() => signIn(provider.id)}
									className="flex items-center gap-2 rounded-full bg-black px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
								>
									<Image
										src={`/assets/img/${provider.name}.svg`}
										alt="provider"
										width={20}
										height={20}
										className="h-4 w-4"
									/>
									Sign in
								</button>
							))}
					</>
				)}
			</div>

			<div className="menu-container relative flex sm:hidden">
				{session?.user ? (
					<div className="flex items-center gap-4">
						<ThemeToggle />
						<button
							onClick={toggleMenu}
							aria-label="User menu"
							aria-expanded={isMenuOpen}
							className="focus:ring-primary-500 relative rounded-full focus:ring-2"
						>
							<Image
								src={session.user.image || "/assets/img/default-user.svg"}
								width={44}
								height={44}
								className="hover:border-primary-500 rounded-full border-2 border-transparent transition-all"
								alt="Profile"
							/>
						</button>

						<AnimatePresence>
							{isMenuOpen && (
								<motion.div
									variants={menuVariants}
									initial="closed"
									animate="open"
									exit="closed"
									className="absolute right-0 top-full mt-3 w-56 origin-top-right divide-y divide-gray-100 rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-gray-800 dark:ring-white/10"
									role="menu"
								>
									<div className="p-2">
										<Link
											href={`/profile/${session.user.id}`}
											className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
											onClick={closeMenu}
											role="menuitem"
										>
											<UserIcon className="h-5 w-5" />
											My Profile
										</Link>
										<Link
											href="/create-prompt"
											className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
											onClick={closeMenu}
											role="menuitem"
										>
											<PlusIcon className="h-5 w-5" />
											Create Prompt
										</Link>
									</div>

									<div className="p-2">
										<button
											onClick={() => {
												closeMenu();
												signOut({ callbackUrl: "/" });
											}}
											className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
											role="menuitem"
										>
											<LogoutIcon className="h-5 w-5" />
											Sign Out
										</button>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				) : (
					<div className="flex items-center gap-3">
						<ThemeToggle />
						{providers &&
							Object.values(providers).map((provider) => (
								<button
									key={provider.name}
									onClick={() => signIn(provider.id)}
									className="flex items-center gap-2 rounded-full bg-black px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
								>
									<Image
										src={`/assets/img/${provider.name}.svg`}
										alt=""
										width={20}
										height={20}
										className="h-4 w-4"
									/>
									Sign in
								</button>
							))}
					</div>
				)}
			</div>
		</nav>
	);
};

const UserIcon = ({ className }: { className?: string }) => (
	<svg
		className={className}
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
		/>
	</svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
	<svg
		className={className}
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M12 4v16m8-8H4"
		/>
	</svg>
);

const LogoutIcon = ({ className }: { className?: string }) => (
	<svg
		className={className}
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
		/>
	</svg>
);

export default Nav;
