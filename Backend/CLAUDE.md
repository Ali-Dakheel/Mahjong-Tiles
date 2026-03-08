<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

## Foundational Context
This application is a Laravel 12 API for a Mahjong Hand Betting Game. Stack:

- php - 8.2+
- laravel/framework (LARAVEL) - v12
- laravel/boost (BOOST) - v1
- laravel/pint (PINT) - v1
- pestphp/pest (PEST) - v4
- pestphp/pest-plugin-laravel - v4
- Database: SQLite (development)

No Filament, no Livewire, no auth — this is a pure REST API.

## Conventions
- Follow existing code conventions. Check sibling files for correct structure.
- Use descriptive names for variables and methods.
- Check for existing components to reuse before writing a new one.

## Replies
- Be concise — focus on what's important.

## Documentation Files
- Only create documentation files if explicitly requested.

=== boost rules ===

## Laravel Boost
- Laravel Boost is an MCP server with powerful tools for this application. Use them.

## Artisan
- Use the `list-artisan-commands` tool when you need to call an Artisan command to double-check available parameters.

## Tinker / Debugging
- Use the `tinker` tool to execute PHP or query Eloquent models directly.
- Use the `database-query` tool when you only need to read from the database.

## Searching Documentation (Critically Important)
- Use the `search-docs` tool before any other approach when dealing with Laravel ecosystem packages.
- Search documentation before making code changes to ensure the correct approach.

=== php rules ===

## PHP

- Always use `declare(strict_types=1);` at the top of every PHP file.
- Always use curly braces for control structures, even single-line.
- Make all classes `final` (models, services, controllers, requests, resources).

### Constructors
- Use PHP 8 constructor property promotion.

### Type Declarations
- Always use explicit return type declarations for all methods.
- Use appropriate PHP type hints for all method parameters.

=== laravel/core rules ===

## Do Things the Laravel Way

- Use `php artisan make:` commands to create files. Pass `--no-interaction`.
- Prefer `Model::query()` over `DB::`.
- Use Eloquent relationships; prevent N+1 with eager loading.
- Always create Form Request classes for validation (never inline).
- Use API Resources for all response shaping.
- API routes versioned at `/api/v1/*`.
- Use environment variables only in config files — never `env()` outside config.

=== laravel/v12 rules ===

## Laravel 12

- Middleware registered in `bootstrap/app.php` via `Application::configure()->withMiddleware()`.
- `bootstrap/providers.php` for service providers.
- Casts defined in a `casts()` method on models.

=== pint/core rules ===

## Laravel Pint
- Run `vendor/bin/pint --dirty --format agent` before finalizing changes.

=== pest/core rules ===

## Pest Tests
- All tests written using Pest. Use `php artisan make:test --pest {name}`.
- Run tests: `php artisan test --compact`.
- Test happy paths, failure paths, edge cases.

</laravel-boost-guidelines>
