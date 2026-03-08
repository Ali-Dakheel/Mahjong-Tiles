FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Add ondrej/php PPA for PHP 8.4 on Ubuntu 24.04
RUN apt-get update && apt-get install -y gnupg curl ca-certificates zip unzip git \
    && mkdir -p /etc/apt/keyrings \
    && curl -sS 'https://keyserver.ubuntu.com/pks/lookup?op=get&search=0xb8dc7e53946656efbce4c1dd71daeaab4ad4cab6' \
       | gpg --dearmor | tee /etc/apt/keyrings/ppa_ondrej_php.gpg > /dev/null \
    && echo "deb [signed-by=/etc/apt/keyrings/ppa_ondrej_php.gpg] https://ppa.launchpadcontent.net/ondrej/php/ubuntu noble main" \
       > /etc/apt/sources.list.d/ppa_ondrej_php.list \
    && apt-get update

# Install PHP 8.4 FPM + SQLite + Nginx + Supervisor
RUN apt-get install -y \
    php8.4-fpm \
    php8.4-cli \
    php8.4-sqlite3 \
    php8.4-mbstring \
    php8.4-xml \
    php8.4-zip \
    php8.4-bcmath \
    php8.4-curl \
    php8.4-opcache \
    nginx \
    supervisor \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/database

COPY docker/nginx.conf /etc/nginx/sites-available/default
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/php.ini /etc/php/8.4/fpm/conf.d/99-production.ini
COPY docker/php-fpm.conf /etc/php/8.4/fpm/pool.d/www.conf
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost/up || exit 1

CMD ["/start.sh"]
