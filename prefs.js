import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class ChesscomNotifierPrefs extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        settings.delay();

        const page = new Adw.PreferencesPage({
            title: _('General'),
        });

        const group = new Adw.PreferencesGroup({
            title: _('Chess.com Notifier Settings'),
        });

        const usernameRow = new Adw.EntryRow({
            title: _('Username'),
        });
        settings.bind('username', usernameRow, 'text', Gio.SettingsBindFlags.DEFAULT);
        group.add(usernameRow);

        const intervalRow = new Adw.SpinRow({
            title: _('Polling Interval'),
            subtitle: _('How often to check for notifications (in seconds)'),
            adjustment: new Gtk.Adjustment({
                lower: 10,
                upper: 3600,
                step_increment: 10,
            }),
        });
        settings.bind('polling-interval', intervalRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        group.add(intervalRow);

        page.add(group);

        const fieldsGroup = new Adw.PreferencesGroup({
            title: _('Notification Fields'),
        });

        const gamesRow = new Adw.SwitchRow({
            title: _('Games'),
        });
        settings.bind('show-games', gamesRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        fieldsGroup.add(gamesRow);

        const messagesRow = new Adw.SwitchRow({
            title: _('Messages'),
        });
        settings.bind('show-messages', messagesRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        fieldsGroup.add(messagesRow);

        const friendsRow = new Adw.SwitchRow({
            title: _('Friend Requests'),
        });
        settings.bind('show-friend-requests', friendsRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        fieldsGroup.add(friendsRow);

        const challengesRow = new Adw.SwitchRow({
            title: _('Challenges'),
        });
        settings.bind('show-challenges', challengesRow, 'active', Gio.SettingsBindFlags.DEFAULT);
        fieldsGroup.add(challengesRow);

        page.add(fieldsGroup);
        window.add(page);

        window.connect('close-request', () => {
            settings.apply();
        });
    }
}
