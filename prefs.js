/*
  Copyright (c) 2026, Shawn Betts <sabetts@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the GNOME nor the names of its contributors may be
      used to endorse or promote products derived from this software without
      specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class ChesscomNotifierPrefs extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

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
    }
}
