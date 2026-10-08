# Sourced by the starter's scripts that call GitHub: defines `retrying`.

# GitHub's 5xx answers and dropped connections, as gh and git print them.
transient='HTTP 5[0-9][0-9]|status code:? 5[0-9][0-9]|returned error: 5[0-9][0-9]|service unavailable|bad gateway|gateway time-?out|timed out|connection reset|connection refused|could not resolve host|hung up unexpectedly|tls handshake'

# Runs a command that talks to GitHub, and again after 1, 2 and 4 seconds
# while it fails on the network or the service. Any other failure, and the
# last, comes back at once with the command's stderr.
retrying() {
	errors="$(mktemp)"
	for wait in 1 2 4 0; do
		status=0
		"$@" 2>"$errors" || status=$?
		if [ "$status" = 0 ] || [ "$wait" = 0 ] ||
			! grep -Eqi "$transient" "$errors"; then
			cat "$errors" >&2
			rm -f "$errors"
			return "$status"
		fi
		echo "$(tail -n 1 "$errors"), trying again in ${wait}s." >&2
		sleep "$wait"
	done
}
