# Todo: Building the Laravel/MySQL Backend for Ensiklopedia AI

This document outlines the step-by-step plan to create the backend for the AI Encyclopedia application using the Laravel framework and a MySQL database. This plan uses **stateless, token-based authentication**.

**Core Architectural Decision:**
-   **Frontend Handles AI:** The frontend application will remain responsible for making all direct API calls to the Google Gemini service.
-   **Backend Manages Data:** The Laravel backend's role is to provide a persistent data layer for:
    1.  User authentication and management.
    2.  Storing user-specific search history **metadata** (the query and timestamp, not the AI response).
    3.  Storing and managing admin-editable content (like the homepage directory).

---

### **Phase 1: Project Setup & Database**

**Objective:** Establish the Laravel project, configure the environment, and create the necessary database structure.

1.  **Initialize Laravel Project:**
    -   Create a new Laravel project: `composer create-project laravel/laravel ensiklopedia-backend`
    -   Navigate into the new directory: `cd ensiklopedia-backend`

2.  **Configure Environment (`.env`):**
    -   Set the application name: `APP_NAME="Ensiklopedia AI"`
    -   Configure the database connection for MySQL:
        ```
        DB_CONNECTION=mysql
        DB_HOST=127.0.0.1
        DB_PORT=3306
        DB_DATABASE=ensiklopedia_ai
        DB_USERNAME=root
        DB_PASSWORD=
        ```
    -   Configure frontend URL for CORS: `FRONTEND_URL="http://localhost:5173"`

3.  **Create Database Migrations:**
    -   **Users Table:** Modify the default migration to add a `username` and `role` column.
        -   `database/migrations/2014_10_12_000000_create_users_table.php`:
            -   `$table->string('username');`
            -   `$table->enum('role', ['User', 'Admin'])->default('User');`
    -   **History Table:** Create a migration for search history metadata.
        -   `php artisan make:migration create_history_items_table`
        -   Fields: `id`, `user_id` (foreign key), `query` (text), `timestamp` (bigInteger, indexed), `timestamps`.
    -   **Settings Table:** Create a migration for application settings.
        -   `php artisan make:migration create_app_settings_table`
        -   Fields: `id`, `key` (string, unique), `value` (longText).

4.  **Run Migrations:**
    -   Execute `php artisan migrate` to create the tables in your MySQL database.

5.  **Define Eloquent Models & Relationships:**
    -   **`app/Models/User.php`**:
        -   Add `username` and `role` to the `$fillable` array.
        -   Define the one-to-many relationship: `public function historyItems() { return $this->hasMany(HistoryItem::class); }`
    -   **`app/Models/HistoryItem.php`**:
        -   Create the model: `php artisan make:model HistoryItem`
        -   Define the inverse relationship: `public function user() { return $this->belongsTo(User::class); }`
        -   Set the `$fillable` array: `['user_id', 'query', 'timestamp']`.
    -   **`app/Models/AppSetting.php`**:
        -   Create the model: `php artisan make:model AppSetting`
        -   Set the `$fillable` array: `['key', 'value']` and disable timestamps: `public $timestamps = false;`

---

### **Phase 2: Authentication & Authorization (Token-Based)**

**Objective:** Implement secure, token-based user registration, login, and API access using Laravel Sanctum API Tokens.

1.  **Install & Configure Laravel Sanctum:**
    -   Install package: `composer require laravel/sanctum`
    -   Publish configuration: `php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"`
    -   In `app/Http/Kernel.php`, ensure `\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class` is **commented out or removed** from the `api` middleware group to enforce statelessness.
    -   In `app/Models/User.php`, add the `HasApiTokens` trait: `use Laravel\Sanctum\HasApiTokens;`

2.  **Create Authentication API:**
    -   Define routes in `routes/api.php` for `/register`, `/login`, and a protected `/logout`.
    -   Create `app/Http/Controllers/Api/AuthController.php`.
    -   Implement methods:
        -   `register()`: Validate input, create a new user, return a success message.
        -   `login()`: Authenticate user, create an API token (`$user->createToken('api-token')->plainTextToken`), and return the token to the frontend.
        -   `logout()`: (Protected route) Revoke the current user's token: `auth()->user()->tokens()->delete()`.
        -   `user()`: (Protected route) Return the currently authenticated user.

3.  **Create Admin Middleware:**
    -   Generate the middleware: `php artisan make:middleware IsAdmin`
    -   In `app/Http/Middleware/IsAdmin.php`, implement logic to check if `Auth::user()->role === 'Admin'`.
    -   Register the middleware in `app/Http/Kernel.php` with the alias `'admin'`.

---

### **Phase 3: Core Encyclopedia & History Features**

**Objective:** Build the API endpoints for managing user-specific history lists and serving the homepage directory content.

1.  **Note on AI Search Logic:**
    -   The frontend will continue to handle all direct API calls to Google Gemini.
    -   The backend is **not** responsible for proxying these requests. Its role is only to store the result's metadata.

2.  **Create Encyclopedia Controller:**
    -   Generate the controller: `php artisan make:controller Api/EncyclopediaController`
    -   Define API routes in `routes/api.php` under the `auth:sanctum` middleware.

3.  **Implement History Management API:**
    -   **`storeHistory(Request $request)`:**
        -   Route: `POST /api/encyclopedia/history`
        -   Action: Receives a `{ query: '...', timestamp: ... }` from the frontend after a successful Gemini API call.
        -   Validates the input and creates a new `HistoryItem` record associated with the authenticated user.
    -   **`getHistory(Request $request)`:**
        -   Route: `GET /api/encyclopedia/history`
        -   Action: Returns the list of `HistoryItem` records for the authenticated user.
    -   **`deleteHistoryItem(Request $request, $timestamp)`:**
        -   Route: `DELETE /api/encyclopedia/history/{timestamp}`
        -   Action: Deletes a specific history item by its timestamp for the user.
    -   **`clearHistory(Request $request)`:**
        -   Route: `DELETE /api/encyclopedia/history`
        -   Action: Deletes all history items for the user.

4.  **Implement Directory Endpoint:**
    -   **`getDirectory(Request $request)`:**
        -   Route: `GET /api/encyclopedia/directory` (This can be a public route, no auth needed).
        -   Action: Retrieves the directory data from the `app_settings` table (`key` = `directory_data`) and returns it as JSON.

---

### **Phase 4: Admin Dashboard Backend**

**Objective:** Create all necessary API endpoints to power the admin dashboard, protected by the `admin` middleware.

1.  **Create Admin Controllers:**
    -   `php artisan make:controller Api/Admin/StatsController`
    -   `php artisan make:controller Api/Admin/UserController --api --model=User`
    -   `php artisan make:controller Api/Admin/SettingsController`

2.  **Define Admin API Routes:**
    -   In `routes/api.php`, create a route group with `prefix('admin')` and `middleware(['auth:sanctum', 'admin'])`.

3.  **Implement Admin Endpoints:**
    -   **Stats (`StatsController`):**
        -   `index()`: Calculate and return `totalUsers`, `totalQueries`, `queriesToday`, `topTopics`, and `recentQueries` by querying the `User` and `HistoryItem` models.
    -   **User Management (`UserController`):**
        -   `index()`: Return all users with their query counts (`withCount('historyItems')`).
        -   `store()`: Create a new user.
        -   `update()`: Update a user's `username` or `role`. Add logic to prevent deleting/demoting the last admin.
        -   `destroy()`: Delete a user and their associated history (cascade delete).
    -   **Content Management (`SettingsController`):**
        -   `updateDirectory(Request $request)`: Validate the incoming directory JSON and save it to the `app_settings` table.

4.  **Create Database Seeders for Sample Data:**
    -   **`php artisan make:seeder AppSettingSeeder`**:
        -   This seeder will populate the default directory content for the homepage.
        -   **Action:** In `database/seeders/AppSettingSeeder.php`, add the following code to the `run()` method.
        ```php
        // inside AppSettingSeeder.php
        public function run(): void
        {
            $directoryData = [
              'id' => [
                [ 'category' => "Era & Kekhalifahan", 'icon' => "Era & Kekhalifahan", 'items' => [ "Masa Khulafaur Rasyidin", "Kekhalifahan Umayyah di Damaskus", "Kekhalifahan Abbasiyah di Baghdad", "Keemasan Islam di Al-Andalus", "Kesultanan Utsmaniyah", "Dinasti Seljuk", ] ],
                [ 'category' => "Ilmu Pengetahuan & Filsafat", 'icon' => "Ilmu Pengetahuan & Filsafat", 'items' => [ "Kontribusi Al-Khawarizmi dalam Aljabar", "Penemuan Ibnu Sina di bidang Kedokteran", "Karya optik Ibnu al-Haytham", "Filsafat Ibnu Rusyd (Averroes)", "Rumah Kebijaksanaan (Bayt al-Hikmah)", "Observatorium Maragheh", ] ],
                [ 'category' => "Seni & Arsitektur", 'icon' => "Seni & Arsitektur", 'items' => [ "Arsitektur Masjid Agung Cordoba", "Keindahan Kaligrafi Kufi dan Naskh", "Istana Alhambra di Granada", "Pengaruh Seni Islam di Eropa", "Pola Geometris dalam Seni Islam", "Masjid Biru (Blue Mosque) di Istanbul", ] ],
                [ 'category' => "Perdagangan & Ekonomi", 'icon' => "Perdagangan & Ekonomi", 'items' => [ "Jalur Sutra dan Peran Pedagang Muslim", "Sistem Mata Uang: Dinar dan Dirham", "Konsep Wakaf dan Peranannya dalam Ekonomi", "Teknik Perbankan Awal: Cek dan Hawala", "Pasar-pasar Terkenal di Dunia Islam", "Peraturan Perdagangan dan Hisbah", ] ],
                [ 'category' => "Kehidupan Sosial & Budaya", 'icon' => "Kehidupan Sosial & Budaya", 'items' => [ "Peran pasar (souk) dalam masyarakat", "Sistem pendidikan: Madrasah dan Kuttab", "Pakaian dan mode di era Abbasiyah", "Perayaan hari besar Islam secara historis", "Peran wanita dalam keilmuan Islam", "Musik dan puisi di Andalusia" ] ],
                [ 'category' => "Tokoh-Tokoh Penting", 'icon' => "Tokoh-Tokoh Penting", 'items' => [ "Biografi Salahuddin Al-Ayyubi", "Perjalanan Ibnu Battuta", "Sultan Muhammad Al-Fatih", "Al-Zahrawi, Bapak Bedah Modern", "Fatima al-Fihri, pendiri universitas", "Jalaluddin Rumi dan sufisme", ] ]
              ],
              'ar' => [ /* Add Arabic translations here */ ],
              'en' => [ /* Add English translations here */ ],
            ];

            \App\Models\AppSetting::updateOrCreate(
                ['key' => 'directory_data'],
                ['value' => json_encode($directoryData)]
            );
        }
        ```

    -   **Modify `DatabaseSeeder.php`**:
        -   This main seeder will create users and their associated history.
        -   **Action:** Replace the content of `database/seeders/DatabaseSeeder.php` with the following:
        ```php
        // inside DatabaseSeeder.php
        use App\Models\User;
        use App\Models\HistoryItem;
        use Illuminate\Database\Seeder;
        use Illuminate\Support\Facades\Hash;

        class DatabaseSeeder extends Seeder
        {
            public function run(): void
            {
                // 1. Create the Admin User
                $admin = User::firstOrCreate(
                    ['email' => 'admin@example.com'],
                    ['username' => 'Admin', 'password' => Hash::make('password123'), 'role' => 'Admin']
                );

                // 2. Create 3 Regular Users
                $users = collect([
                    User::firstOrCreate(['email' => 'user1@example.com'], ['username' => 'User One', 'password' => Hash::make('password123'), 'role' => 'User']),
                    User::firstOrCreate(['email' => 'user2@example.com'], ['username' => 'User Two', 'password' => Hash::make('password123'), 'role' => 'User']),
                    User::firstOrCreate(['email' => 'user3@example.com'], ['username' => 'User Three', 'password' => Hash::make('password123'), 'role' => 'User']),
                ]);

                $allUsers = $users->push($admin);
                $sampleQueries = [
                    "Sejarah Kekhalifahan Abbasiyah",
                    "Kontribusi Ibnu Sina di bidang kedokteran",
                    "Perjalanan Ibnu Battuta",
                    "Arsitektur Istana Alhambra",
                    "Siapakah Salahuddin Al-Ayyubi?",
                    "Peran Jalur Sutra bagi pedagang Muslim",
                    "Rumah Kebijaksanaan di Baghdad"
                ];

                // 3. Create 5 sample history items for each user
                $allUsers->each(function (User $user) use ($sampleQueries) {
                    for ($i = 0; $i < 5; $i++) {
                        HistoryItem::create([
                            'user_id' => $user->id,
                            'query' => $sampleQueries[array_rand($sampleQueries)],
                            'timestamp' => now()->subDays($i)->valueOf(), // now()->valueOf() gives milliseconds
                        ]);
                    }
                });

                // 4. Seed the application settings (directory, etc.)
                $this->call(AppSettingSeeder::class);
            }
        }
        ```
    -   **Run the Seeder:**
        -   Execute `php artisan migrate:fresh --seed` to clear the database and run all seeders.

---

### **Phase 5: Final Configuration & Testing**

**Objective:** Ensure the application is correctly configured for security and functionality.

1.  **Configure CORS:**
    -   In `config/cors.php`, ensure `allowed_origins` points to your `FRONTEND_URL`. Set `allowed_methods` and `allowed_headers` to be permissive (`['*']`) or specific as needed (e.g., allow `Authorization` header).

2.  **Test API Endpoints:**
    -   Use an API client like Postman or Insomnia to test every endpoint.
    -   **Auth Flow:** Test register, login (and receive a token), access protected routes (with `Authorization: Bearer <token>` header), and logout.
    -   **User Flow:** Test saving history, viewing history, deleting history.
    -   **Admin Flow:** Test viewing stats, CRUD operations on users, and updating the directory content.
    -   Verify that non-admin users receive a `403 Forbidden` error when trying to access admin endpoints.
    -   Verify that unauthenticated requests receive a `401 Unauthorized` error on protected routes.