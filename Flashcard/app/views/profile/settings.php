<div class="container py-5">
    <div class="row">
        <!-- Sidebar Navigation -->
        <div class="col-md-3">
            <div class="card">
                <div class="list-group list-group-flush">
                    <a href="#profile" class="list-group-item list-group-item-action active" data-bs-toggle="list">
                        <i class="bi bi-person me-2"></i> Profile
                    </a>
                    <a href="#preferences" class="list-group-item list-group-item-action" data-bs-toggle="list">
                        <i class="bi bi-gear me-2"></i> Preferences
                    </a>
                    <a href="#notifications" class="list-group-item list-group-item-action" data-bs-toggle="list">
                        <i class="bi bi-bell me-2"></i> Notifications
                    </a>
                    <a href="#security" class="list-group-item list-group-item-action" data-bs-toggle="list">
                        <i class="bi bi-shield-lock me-2"></i> Security
                    </a>
                </div>
            </div>
        </div>

        <!-- Settings Content -->
        <div class="col-md-9">
            <div class="tab-content">
                <!-- Profile Section -->
                <div class="tab-pane fade show active" id="profile">
                    <div class="card">
                        <div class="card-body">
                            <h3 class="card-title mb-4">Profile Settings</h3>
                            <form action="/profile/update" method="POST" class="needs-validation" novalidate>
                                <div class="mb-3">
                                    <label for="displayName" class="form-label">Display Name</label>
                                    <input type="text" class="form-control" id="displayName" name="display_name" 
                                           value="<?php echo htmlspecialchars($user->getDisplayName()); ?>" required>
                                </div>
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="email" name="email" 
                                           value="<?php echo htmlspecialchars($user->getEmail()); ?>" required>
                                </div>
                                <div class="mb-3">
                                    <label for="bio" class="form-label">Bio</label>
                                    <textarea class="form-control" id="bio" name="bio" rows="3"><?php echo htmlspecialchars($user->getBio() ?? ''); ?></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary">Save Changes</button>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Preferences Section -->
                <div class="tab-pane fade" id="preferences">
                    <div class="card">
                        <div class="card-body">
                            <h3 class="card-title mb-4">App Preferences</h3>
                            <form action="/profile/preferences" method="POST">
                                <div class="mb-3">
                                    <label class="form-label d-block">Theme</label>
                                    <div class="btn-group" role="group">
                                        <input type="radio" class="btn-check" name="theme" id="light" value="light" 
                                               <?php echo ($preferences['theme'] ?? '') === 'light' ? 'checked' : ''; ?>>
                                        <label class="btn btn-outline-primary" for="light">Light</label>

                                        <input type="radio" class="btn-check" name="theme" id="dark" value="dark"
                                               <?php echo ($preferences['theme'] ?? '') === 'dark' ? 'checked' : ''; ?>>
                                        <label class="btn btn-outline-primary" for="dark">Dark</label>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="cardsPerSession" class="form-label">Cards per Study Session</label>
                                    <select class="form-select" id="cardsPerSession" name="cards_per_session">
                                        <option value="10" <?php echo ($preferences['cards_per_session'] ?? '') == 10 ? 'selected' : ''; ?>>10 cards</option>
                                        <option value="20" <?php echo ($preferences['cards_per_session'] ?? '') == 20 ? 'selected' : ''; ?>>20 cards</option>
                                        <option value="30" <?php echo ($preferences['cards_per_session'] ?? '') == 30 ? 'selected' : ''; ?>>30 cards</option>
                                        <option value="50" <?php echo ($preferences['cards_per_session'] ?? '') == 50 ? 'selected' : ''; ?>>50 cards</option>
                                    </select>
                                </div>
                                <button type="submit" class="btn btn-primary">Save Preferences</button>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Notifications Section -->
                <div class="tab-pane fade" id="notifications">
                    <div class="card">
                        <div class="card-body">
                            <h3 class="card-title mb-4">Notification Settings</h3>
                            <form action="/profile/notifications" method="POST">
                                <div class="mb-3">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="emailNotifications" name="email_notifications"
                                               <?php echo ($notifications['email'] ?? false) ? 'checked' : ''; ?>>
                                        <label class="form-check-label" for="emailNotifications">Email Notifications</label>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="pushNotifications" name="push_notifications"
                                               <?php echo ($notifications['push'] ?? false) ? 'checked' : ''; ?>>
                                        <label class="form-check-label" for="pushNotifications">Push Notifications</label>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="reminderTime" class="form-label">Daily Reminder Time</label>
                                    <input type="time" class="form-control" id="reminderTime" name="reminder_time"
                                           value="<?php echo $notifications['reminder_time'] ?? '09:00'; ?>">
                                </div>
                                <button type="submit" class="btn btn-primary">Save Notification Settings</button>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Security Section -->
                <div class="tab-pane fade" id="security">
                    <div class="card">
                        <div class="card-body">
                            <h3 class="card-title mb-4">Security Settings</h3>
                            <form action="/profile/password" method="POST" class="needs-validation" novalidate>
                                <div class="mb-3">
                                    <label for="currentPassword" class="form-label">Current Password</label>
                                    <input type="password" class="form-control" id="currentPassword" name="current_password" required>
                                </div>
                                <div class="mb-3">
                                    <label for="newPassword" class="form-label">New Password</label>
                                    <input type="password" class="form-control" id="newPassword" name="new_password" required>
                                </div>
                                <div class="mb-3">
                                    <label for="confirmPassword" class="form-label">Confirm New Password</label>
                                    <input type="password" class="form-control" id="confirmPassword" name="confirm_password" required>
                                </div>
                                <button type="submit" class="btn btn-primary">Change Password</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
