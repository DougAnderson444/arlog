export function handle(state, action) {
	if (action.caller !== state.owner) {
		return { state }; // readonly unless you'r the owner
	}
	if (action.input.function === 'Update') {
		state.latest = action.input.latest;
	}

	return { state };
}
