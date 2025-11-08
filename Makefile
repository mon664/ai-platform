.PHONY: help build test clean install lint format check publish release

# Default target
help:
	@echo "Available targets:"
	@echo "  build     - Build the project"
	@echo "  test      - Run tests"
	@echo "  clean     - Clean build artifacts"
	@echo "  install   - Install locally"
	@echo "  lint      - Run clippy lints"
	@echo "  format    - Format code"
	@echo "  check     - Run all checks (format, lint, test)"
	@echo "  publish   - Publish to crates.io"
	@echo "  release   - Create release"

# Build the project
build:
	cargo build --release

# Run tests
test:
	cargo test

# Clean build artifacts
clean:
	cargo clean

# Install locally
install: build
	cargo install --path .

# Run clippy lints
lint:
	cargo clippy --all-targets --all-features -- -D warnings

# Format code
format:
	cargo fmt

# Run all checks
check: format lint test

# Publish to crates.io
publish: check
	cargo publish

# Create release
release: clean test build
	@echo "Release ready in target/release/"
	@echo "Create a tag and push to trigger release:"
	@echo "  git tag v0.1.0"
	@echo "  git push origin v0.1.0"

# Setup development environment
setup:
	rustup component add rustfmt clippy

# Show version
version:
	cargo --version && rustc --version