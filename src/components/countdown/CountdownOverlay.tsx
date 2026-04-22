import { useCallback, useEffect, useState } from "react";

export function CountdownOverlay() {
	const [countdown, setCountdown] = useState<number | null>(null);

	useEffect(() => {
		void window.electronAPI.getActiveCountdown().then((result) => {
			if (result.success && typeof result.seconds === "number") {
				setCountdown(result.seconds);
			}
		});

		const cleanup = window.electronAPI.onCountdownTick((seconds: number) => {
			setCountdown(seconds);
		});

		return cleanup;
	}, []);

	const handleCancel = useCallback(() => {
		window.electronAPI.cancelCountdown();
	}, []);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === "Escape") {
				handleCancel();
			}
		},
		[handleCancel],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	if (countdown === null) {
		return null;
	}

	return (
		<div
			className="fixed inset-0 flex items-center justify-center select-none cursor-pointer"
			onClick={handleCancel}
			onKeyDown={(e) => e.key === "Escape" && handleCancel()}
		>
			<div
				className="relative flex items-center justify-center rounded-full"
				style={{
					width: 152,
					height: 152,
					background: "rgba(14, 14, 18, 0.72)",
					border: "1px solid rgba(255,255,255,0.18)",
					backdropFilter: "blur(16px)",
				}}
			>
				<span
					className="text-white font-semibold tabular-nums tracking-tight"
					style={{
						fontSize: "78px",
						lineHeight: 1,
						textShadow: "0 1px 6px rgba(0,0,0,0.35)",
					}}
				>
					{countdown}
				</span>
			</div>
		</div>
	);
}
