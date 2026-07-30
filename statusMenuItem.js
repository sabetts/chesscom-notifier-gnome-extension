import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

export const StatusMenuItem = GObject.registerClass(
class StatusMenuItem extends PopupMenu.PopupBaseMenuItem {
    _init(iconName, label, value) {
        super._init({ reactive: false });

        this._iconActor = new St.Icon({
            icon_name: iconName,
            style_class: 'popup-menu-icon',
        });
        this.add_child(this._iconActor);

        this._labelActor = new St.Label({ text: label });
        this.add_child(this._labelActor);

        this._valueLabel = new St.Label({ text: value });
        this._valueLabel.set_x_align(Clutter.ActorAlign.END);
        this._valueLabel.set_x_expand(true);
        this.add_child(this._valueLabel);
    }

    set value(text) {
        this._valueLabel.text = text;
    }
});
